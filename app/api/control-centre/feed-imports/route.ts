import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';
import { parseAwinFeed, parseCraftBuddyGoogleFeed } from '../../../../lib/feed-imports/parse';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
    const { data: roleRow } = await supabase.from('user_roles').select('role').eq('user_id', user.id).maybeSingle();
    if (!roleRow || !['admin', 'owner'].includes(roleRow.role)) return NextResponse.json({ error: 'Owner or admin permission required' }, { status: 403 });
    const form = await request.formData(); const file = form.get('file');
    if (!(file instanceof File)) return NextResponse.json({ error: 'Choose a .csv or .csv.gz feed' }, { status: 400 });
    if (!/\.csv(\.gz)?$/i.test(file.name) || file.size > 8 * 1024 * 1024) return NextResponse.json({ error: 'Only CSV/gzip files up to 8MB are allowed' }, { status: 400 });
    const craftBuddy = /^45747-retail-en_GB\.csv(\.gz)?$/i.test(file.name);
    const { records, total, review, excluded } = craftBuddy ? parseCraftBuddyGoogleFeed(Buffer.from(await file.arrayBuffer()), /\.gz$/i.test(file.name)) : parseAwinFeed(Buffer.from(await file.arrayBuffer()), /\.gz$/i.test(file.name));
    // Deny cross-merchant uploads in the pilot. AKKO UK's Awin merchant ID is 69178.
    const merchantId = craftBuddy ? '45747' : '69178';
    const merchantName = craftBuddy ? 'Craft Buddy Shop' : 'AKKO UK';
    if (records.some(r => r.merchant_id !== merchantId)) return NextResponse.json({ error: 'Mixed or unsupported advertiser feed' }, { status: 400 });
    const { data: run, error: runError } = await supabase.from('feed_import_runs').insert({ created_by: user.id, merchant_id: merchantId, merchant_name: merchantName, filename: file.name.slice(0,255), total_count: total, review_count: review, excluded_count: excluded, status: 'private_review', permission_status: 'unverified' }).select('id').single();
    if (runError || !run) throw new Error(runError?.message || 'Could not create import run');
    for (let i = 0; i < records.length; i += 200) {
      const batch = records.slice(i, i + 200).map(r => ({ import_id: run.id, ...r }));
      const { error } = await supabase.from('feed_import_records').insert(batch);
      if (error) {
        await supabase.from('feed_import_records').delete().eq('import_id', run.id);
        await supabase.from('feed_import_runs').delete().eq('id', run.id);
        throw new Error('Import rows failed: ' + error.message);
      }
    }
    return NextResponse.json({ id: run.id, total, review, excluded });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Import failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

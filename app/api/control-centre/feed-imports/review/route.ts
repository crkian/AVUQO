import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../../../../lib/supabase/server';

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
    const { data: role } = await supabase.from('user_roles').select('role').eq('user_id', user.id).maybeSingle();
    if (!role || !['owner', 'admin'].includes(role.role)) return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    const body = await request.json();
    const id = typeof body.id === 'string' ? body.id : '';
    const decision = body.decision;
    const notes = typeof body.notes === 'string' ? body.notes.trim() : '';
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) || !['pending','checked','needs_attention'].includes(decision) || notes.length > 1000)
      return NextResponse.json({ error: 'Invalid review details' }, { status: 400 });
    const { data, error } = await supabase.from('feed_import_records').update({ review_decision: decision, review_notes: notes, reviewed_by: user.id, reviewed_at: new Date().toISOString() }).eq('id', id).select('id').maybeSingle();
    if (error) return NextResponse.json({ error: 'Could not save review: ' + error.message }, { status: 400 });
    if (!data) return NextResponse.json({ error: 'Record not found or access denied' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }); }
}

-- Optional development-only data. Safe to skip.
insert into public.exceptions(exception_type,severity,entity_type,status,reason,data)
select 'source_freshness','high','source','open','Demo source has not completed a successful sync within its expected freshness window','{"demo":true}'::jsonb
where not exists(select 1 from public.exceptions where data->>'demo'='true');

insert into public.automation_jobs(job_type,status,attempts,payload,error_message)
select 'refresh_source','failed',2,'{"connector":"demo"}'::jsonb,'Demo network timeout for Control Centre testing'
where not exists(select 1 from public.automation_jobs where payload->>'connector'='demo');

insert into public.promotion_candidates(target_channel,avuqo_score,avuqo_confidence,promotion_score,promotion_tier,destination_type,affiliate_eligible,compliance_clear,status,rationale,title_snapshot,merchant_snapshot,category_snapshot)
select 'pinterest',96,93,91,'priority','avuqo',true,true,'review','{"reason":"Strong visual fit and exceptional verified value","demo":true}'::jsonb,'Dyson V15 Detect cordless vacuum','Demo Home Store','Home'
where not exists(select 1 from public.promotion_candidates where rationale->>'demo'='true');

insert into public.trust_metric_snapshots(metric_key,metric_value,period_start,period_end,metadata) values
 ('verified_deal_accuracy_pct',98.4,current_date-30,current_date,'{"demo":true}'::jsonb),
 ('broken_affiliate_link_pct',0.7,current_date-30,current_date,'{"demo":true}'::jsonb),
 ('stale_offer_pct',1.2,current_date-30,current_date,'{"demo":true}'::jsonb),
 ('found_better_feedback_rate_pct',2.1,current_date-30,current_date,'{"demo":true}'::jsonb);

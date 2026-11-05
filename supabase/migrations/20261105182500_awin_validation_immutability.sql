-- Reject any changes to saved diagnostic reports, including service-role writes.
-- Validation corrections require a new reviewed snapshot/report, never mutation.
create or replace function public.reject_private_awin_validation_mutation()
returns trigger language plpgsql set search_path='' as $$
begin
 raise exception 'Private Awin snapshot validation reports are immutable';
end
$$;
drop trigger if exists awin_private_validation_immutable on public.awin_private_snapshot_validations;
create trigger awin_private_validation_immutable
before update or delete on public.awin_private_snapshot_validations
for each row execute function public.reject_private_awin_validation_mutation();
revoke all on function public.reject_private_awin_validation_mutation() from public,anon,authenticated;

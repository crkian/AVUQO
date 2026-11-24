-- Owner identity derives only from the authenticated JWT, never form input.
-- The privileged implementation lives outside the exposed API schema.
create schema if not exists shopping_private;
revoke all on schema shopping_private from public,anon,authenticated,service_role;
grant usage on schema shopping_private to authenticated;
create function shopping_private.review_as_owner(
 p_offer_id uuid,p_status text,p_expected_price numeric,p_expected_digest text,p_note text
) returns void language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid();
begin
 if actor is null or not exists(select 1 from public.user_roles where user_id=actor and role='owner') then
  raise exception 'Owner role required' using errcode='42501';
 end if;
 perform public.record_awin_shopping_owner_review(p_offer_id,actor,p_status,p_expected_price,p_expected_digest,p_note);
end;
$$;
revoke all on function shopping_private.review_as_owner(uuid,text,numeric,text,text) from public,anon,authenticated,service_role;
grant execute on function shopping_private.review_as_owner(uuid,text,numeric,text,text) to authenticated;
create function public.review_shopping_as_owner(
 p_offer_id uuid,p_status text,p_expected_price numeric,p_expected_digest text,p_note text
) returns void language sql security invoker set search_path='' as $$
 select shopping_private.review_as_owner(p_offer_id,p_status,p_expected_price,p_expected_digest,p_note);
$$;
revoke all on function public.review_shopping_as_owner(uuid,text,numeric,text,text) from public,anon,authenticated,service_role;
grant execute on function public.review_shopping_as_owner(uuid,text,numeric,text,text) to authenticated;

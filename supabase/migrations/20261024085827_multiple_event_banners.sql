begin;

-- Preserve existing event IDs and content while allowing additional events.
alter table public.event_banner_settings
  drop constraint event_banner_settings_id_check,
  alter column id set default gen_random_uuid()::text;

grant delete on public.event_banner_settings to authenticated;

create policy "Admins delete event settings" on public.event_banner_settings
for delete to authenticated
using ((select private.event_banner_has_permission('home_settings:update')));

commit;

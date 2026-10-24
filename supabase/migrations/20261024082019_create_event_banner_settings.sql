begin;

create table public.event_banner_settings (
  id text primary key default 'default' check (id = 'default'),
  name text not null check (length(btrim(name)) between 1 and 255),
  image_url text not null check (length(btrim(image_url)) > 0),
  start_date date not null,
  end_date date not null,
  enabled boolean not null default false,
  updated_at timestamptz not null default now(),
  constraint event_banner_date_order check (end_date >= start_date)
);

-- Match the application's existing role and wildcard permission rules.
-- Keep this internal lookup outside the exposed API schema.
create schema if not exists private;
grant usage on schema private to authenticated;

create function private.event_banner_has_permission(required_permission text)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    join public.admin_roles r on r.id = p.admin_role_id
    where p.id = (select auth.uid()) and p.role = 'admin'
      and required_permission in ('home_settings:read', 'home_settings:update')
      and to_jsonb(r.permissions) ?| array['*', 'home_settings:*', required_permission]
  );
$$;

revoke all on function private.event_banner_has_permission(text) from public, anon, authenticated, service_role;
grant execute on function private.event_banner_has_permission(text) to authenticated;

alter table public.event_banner_settings enable row level security;
revoke all on public.event_banner_settings from anon, authenticated;
grant select on public.event_banner_settings to anon, authenticated;
grant insert, update on public.event_banner_settings to authenticated;
grant all on public.event_banner_settings to service_role;

create policy "Visitors read current event" on public.event_banner_settings
for select to anon, authenticated
using (enabled and start_date <= (now() at time zone 'Asia/Kolkata')::date
  and end_date >= (now() at time zone 'Asia/Kolkata')::date);

create policy "Admins read event settings" on public.event_banner_settings
for select to authenticated
using ((select private.event_banner_has_permission('home_settings:read'))
  or (select private.event_banner_has_permission('home_settings:update')));

create policy "Admins insert event settings" on public.event_banner_settings
for insert to authenticated
with check ((select private.event_banner_has_permission('home_settings:update')));

create policy "Admins update event settings" on public.event_banner_settings
for update to authenticated
using ((select private.event_banner_has_permission('home_settings:update')))
with check ((select private.event_banner_has_permission('home_settings:update')));

commit;

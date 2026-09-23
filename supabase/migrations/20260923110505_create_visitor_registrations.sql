create table if not exists public.visitor_registrations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  first_name text not null,
  last_name text not null,
  company_name text not null,
  designation text not null,
  whatsapp_number text not null,
  email text not null,
  website text not null,
  county_country text not null,
  industries text[] not null default '{}',
  industry_other text not null default '',
  business_types text[] not null default '{}',
  business_type_other text not null default '',
  looking_for text not null,
  partnership_interest text not null default '',
  referral_source text not null,
  referral_source_other text not null default '',
  privacy_consent boolean not null default false,
  constraint visitor_registrations_privacy_consent_check
    check (privacy_consent = true)
);

create index if not exists visitor_registrations_created_at_idx
  on public.visitor_registrations (created_at desc);

alter table public.visitor_registrations enable row level security;

revoke all on table public.visitor_registrations from anon, authenticated;
grant select on table public.visitor_registrations to authenticated;
grant insert on table public.visitor_registrations to service_role;

drop policy if exists "Admins can view visitor registrations"
  on public.visitor_registrations;

create policy "Admins can view visitor registrations"
  on public.visitor_registrations
  for select
  to authenticated
  using (public.is_admin());

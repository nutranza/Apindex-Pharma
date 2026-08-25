create table if not exists public.artistly_image_publications (
  id uuid primary key default gen_random_uuid(),
  idempotency_key text not null unique check (char_length(idempotency_key) between 8 and 160),
  product_id text not null references public.products(id) on delete cascade,
  image_url text not null,
  image_version timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists artistly_image_publications_product_id
  on public.artistly_image_publications (product_id, created_at desc);

alter table public.artistly_image_publications enable row level security;
revoke all on public.artistly_image_publications from anon, authenticated;

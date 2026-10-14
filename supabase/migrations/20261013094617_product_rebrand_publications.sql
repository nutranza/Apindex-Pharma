-- Separate from Artistly: only the new API uses this narrow, transactional save.
create table public.product_rebrand_publications (
  idempotency_key text primary key check (idempotency_key ~ '^[A-Za-z0-9_-]{8,160}$'),
  -- History survives normal admin deletion and must not prevent that deletion.
  product_id text not null,
  payload_hash text not null check (payload_hash ~ '^[a-f0-9]{64}$'),
  before_values jsonb not null,
  after_values jsonb not null,
  result jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.product_rebrand_publications enable row level security;
revoke all on public.product_rebrand_publications from public, anon, authenticated;
grant select, insert on public.product_rebrand_publications to service_role;

create function public.publish_product_rebrand(
  p_product_id text, p_expected_version timestamptz, p_idempotency_key text,
  p_payload_hash text, p_patch jsonb, p_image_url text default null
) returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  v_product public.products%rowtype;
  v_publication public.product_rebrand_publications%rowtype;
  v_before jsonb;
  v_result jsonb;
  v_metadata jsonb;
begin
  if p_expected_version is null or p_idempotency_key is null or p_payload_hash is null
    or p_idempotency_key !~ '^[A-Za-z0-9_-]{8,160}$' or p_payload_hash !~ '^[a-f0-9]{64}$'
    or p_patch is null or jsonb_typeof(p_patch) <> 'object'
    or exists (select 1 from jsonb_object_keys(p_patch) as fields(key)
      where key not in ('name', 'description', 'shortDescription', 'tradeName'))
    or exists (select 1 from jsonb_each(p_patch) as fields(key, value)
      where jsonb_typeof(value) not in ('string', 'null'))
    or (p_patch ? 'name' and (jsonb_typeof(p_patch->'name') <> 'string' or length(btrim(p_patch->>'name')) = 0))
    or (p_image_url is null and p_patch = '{}'::jsonb)
    or (p_image_url is not null and p_image_url !~ '^https://') then
    raise exception 'REBRAND_INVALID';
  end if;
  -- Serializes duplicate keys across products and concurrent retries.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_idempotency_key, 0));
  select * into v_publication from public.product_rebrand_publications where idempotency_key = p_idempotency_key;
  if found then
    if v_publication.product_id <> p_product_id or v_publication.payload_hash <> p_payload_hash then
      raise exception 'REBRAND_KEY_CONFLICT';
    end if;
    return v_publication.result || jsonb_build_object('replayed', true);
  end if;
  select * into v_product from public.products where id = p_product_id for update;
  if not found then raise exception 'REBRAND_NOT_FOUND'; end if;
  if v_product.updated_at is distinct from p_expected_version then raise exception 'REBRAND_STALE_VERSION'; end if;
  v_before := to_jsonb(v_product);
  v_metadata := v_product.metadata;
  if p_patch ? 'tradeName' then
    v_metadata := coalesce(v_metadata, '{}'::jsonb);
    if jsonb_typeof(v_metadata) <> 'object'
      or (v_metadata ? 'pharma_details' and jsonb_typeof(v_metadata->'pharma_details') not in ('object', 'null')) then
      raise exception 'REBRAND_INVALID_METADATA';
    end if;
    v_metadata := jsonb_set(v_metadata, '{pharma_details}',
      coalesce(nullif(v_metadata->'pharma_details', 'null'::jsonb), '{}'::jsonb)
        || jsonb_build_object('trade_name', p_patch->'tradeName'));
  end if;
  update public.products set
    name = case when p_patch ? 'name' then p_patch->>'name' else name end,
    description = case when p_patch ? 'description' then p_patch->>'description' else description end,
    short_description = case when p_patch ? 'shortDescription' then p_patch->>'shortDescription' else short_description end,
    metadata = v_metadata,
    image_url = coalesce(p_image_url, image_url),
    thumbnail = case when p_image_url is not null then p_image_url else thumbnail end,
    images = case when p_image_url is not null then array[p_image_url] else images end,
    image_embedding = case when p_image_url is not null then null else image_embedding end,
    updated_at = clock_timestamp()
  where id = p_product_id returning * into v_product;
  v_result := jsonb_build_object('productId', v_product.id, 'handle', v_product.handle,
    'imageUrl', v_product.image_url, 'version', v_product.updated_at, 'replayed', false);
  insert into public.product_rebrand_publications(idempotency_key, product_id, payload_hash, before_values, after_values, result)
    values(p_idempotency_key, p_product_id, p_payload_hash, v_before, to_jsonb(v_product), v_result);
  return v_result;
end;
$$;
revoke all on function public.publish_product_rebrand(text, timestamptz, text, text, jsonb, text) from public, anon, authenticated;
grant execute on function public.publish_product_rebrand(text, timestamptz, text, text, jsonb, text) to service_role;

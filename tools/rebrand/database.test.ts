import { after, before, test } from "node:test"
import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { Client } from "pg"
import { z } from "zod"

// This suite deliberately cannot run against a normal local or remote database.
// Start an isolated PostgreSQL instance and create an empty rebrand_test database.
const connectionString = process.env.REBRAND_TEST_DATABASE_URL
if (connectionString) {
  const url = new URL(connectionString)
  if (url.hostname !== "127.0.0.1" || url.port !== "65439" || url.pathname !== "/rebrand_test") throw new Error("Database tests require the dedicated local rebrand_test database on port 65439.")
}
const client = new Client({ connectionString })
const enabled = Boolean(connectionString)
const resultSchema = z.object({ productId: z.string(), handle: z.string(), imageUrl: z.string().nullable(), version: z.string(), replayed: z.boolean() })

before(async () => {
  if (!enabled) return
  await client.connect()
  await client.query(`
    drop schema public cascade;
    create schema public;
    do $$ begin
      if not exists(select 1 from pg_roles where rolname='anon') then create role anon; end if;
      if not exists(select 1 from pg_roles where rolname='authenticated') then create role authenticated; end if;
      if not exists(select 1 from pg_roles where rolname='service_role') then create role service_role bypassrls; end if;
    end $$;
    create table public.products (
      id text primary key, handle text not null, name text not null, description text,
      short_description text, metadata jsonb, image_url text, thumbnail text, images text[],
      image_embedding real[], updated_at timestamptz not null default now(),
      price numeric default 42, stock_count int default 17, category_id text default 'keep-category'
    );
    grant usage on schema public to service_role;
    grant select, update on public.products to service_role;
  `)
  await client.query(await readFile("supabase/migrations/20261013094617_product_rebrand_publications.sql", "utf8"))
})
after(async () => { if (enabled) await client.end() })

async function seed(id: string): Promise<string> {
  const { rows } = await client.query<{ version: string }>(`insert into products(id,handle,name,description,short_description,metadata,image_url,thumbnail,images,image_embedding)
    values($1,'keep-handle','Wellovir','Original description','Original summary',
      '{"unrelated":{"keep":true},"pharma_details":{"trade_name":"Wellovir","available_strength":"10 mg","future_field":"keep"}}',
      'https://example/old.png','https://example/thumb.png',array['https://example/old.png','https://example/other.png'],array[1.0,2.0])
    returning updated_at::text as version`, [id])
  return rows[0].version
}
async function publish(id: string, version: string, key: string, patch: object, image: string | null = null, hash = "a".repeat(64)) {
  const { rows } = await client.query<{ result: unknown }>("select public.publish_product_rebrand($1,$2,$3,$4,$5,$6) as result", [id, version, key, hash, patch, image])
  return resultSchema.parse(rows[0].result)
}

test("database: image/text/history commit together and unrelated values survive", { skip: !enabled }, async () => {
  const version = await seed("db1")
  await client.query("set role service_role")
  const result = await publish("db1", version, "database-image-1", { name: "Dexovir", tradeName: "Dexovir", description: "Apindex Pharmaceutics" }, "https://example/new.png")
  await client.query("reset role")
  const { rows } = await client.query<{ value: unknown }>("select to_jsonb(p) as value from products p where id='db1'")
  const saved = z.object({ name: z.string(), handle: z.string(), description: z.string(), images: z.array(z.string()), thumbnail: z.string(), image_embedding: z.null(),
    price: z.number(), stock_count: z.number(), category_id: z.string(), metadata: z.object({ unrelated: z.object({ keep: z.boolean() }), pharma_details: z.object({ trade_name: z.string(), available_strength: z.string(), future_field: z.string() }) }) }).parse(rows[0].value)
  assert.equal(saved.name, "Dexovir"); assert.equal(saved.handle, "keep-handle")
  assert.deepEqual(saved.images, ["https://example/new.png"]); assert.equal(saved.thumbnail, "https://example/new.png")
  assert.equal(saved.metadata.pharma_details.trade_name, "Dexovir"); assert.equal(saved.metadata.pharma_details.available_strength, "10 mg")
  assert.equal(saved.metadata.pharma_details.future_field, "keep"); assert.equal(saved.metadata.unrelated.keep, true)
  assert.equal(saved.price, 42); assert.equal(saved.stock_count, 17); assert.equal(saved.category_id, "keep-category")
  const history = await client.query<{ before_values: { name: string }; after_values: { name: string } }>("select before_values,after_values from product_rebrand_publications where idempotency_key='database-image-1'")
  assert.equal(history.rows[0].before_values.name, "Wellovir"); assert.equal(history.rows[0].after_values.name, "Dexovir")
  assert.equal((await publish("db1", version, "database-image-1", { name: "Dexovir", tradeName: "Dexovir", description: "Apindex Pharmaceutics" }, "https://example/new.png")).replayed, true)
  await assert.rejects(publish("db1", version, "database-image-1", {}, null, "b".repeat(64)), /REBRAND_INVALID|REBRAND_KEY_CONFLICT/)
  assert.ok(result.version)
})
test("database: text-only saves preserve images and stale writes create no history", { skip: !enabled }, async () => {
  const version = await seed("db2")
  await publish("db2", version, "database-text-2", { shortDescription: "New summary" })
  const { rows } = await client.query<{ images: string[]; image_embedding: number[]; metadata: unknown }>("select images,image_embedding,metadata from products where id='db2'")
  assert.deepEqual(rows[0].images, ["https://example/old.png", "https://example/other.png"])
  assert.deepEqual(rows[0].image_embedding, [1,2])
  await assert.rejects(publish("db2", version, "database-stale-2", { name: "wrong" }), /REBRAND_STALE_VERSION/)
  const count = await client.query<{ count: string }>("select count(*) from product_rebrand_publications where idempotency_key='database-stale-2'")
  assert.equal(count.rows[0].count, "0")
})
test("database: history insertion failure rolls back product changes", { skip: !enabled }, async () => {
  const version = await seed("db3")
  await client.query(`create function public.fail_test_history() returns trigger language plpgsql as $$ begin raise exception 'test insertion failure'; end $$;
    create trigger fail_test_history before insert on product_rebrand_publications for each row execute function public.fail_test_history();`)
  try { await assert.rejects(publish("db3", version, "database-rollback-3", { name: "not-saved" }), /test insertion failure/) }
  finally { await client.query("drop trigger fail_test_history on product_rebrand_publications; drop function public.fail_test_history();") }
  const { rows } = await client.query<{ name: string }>("select name from products where id='db3'")
  assert.equal(rows[0].name, "Wellovir")
})
test("database: anonymous/authenticated users cannot execute the save or access history", { skip: !enabled }, async () => {
  const { rows } = await client.query<{ anon: boolean; authenticated: boolean; service: boolean; history: boolean; rls: boolean }>(`select
    has_function_privilege('anon','publish_product_rebrand(text,timestamptz,text,text,jsonb,text)','execute') as anon,
    has_function_privilege('authenticated','publish_product_rebrand(text,timestamptz,text,text,jsonb,text)','execute') as authenticated,
    has_function_privilege('service_role','publish_product_rebrand(text,timestamptz,text,text,jsonb,text)','execute') as service,
    has_table_privilege('anon','product_rebrand_publications','select') as history,
    (select relrowsecurity from pg_class where oid='product_rebrand_publications'::regclass) as rls`)
  assert.deepEqual(rows[0], { anon: false, authenticated: false, service: true, history: false, rls: true })
})
test("database: concurrent identical requests produce one publication", { skip: !enabled }, async () => {
  const version = await seed("db4")
  const second = new Client({ connectionString }); await second.connect()
  try {
    const params = ["db4", version, "database-concurrent-4", "a".repeat(64), { name: "Dexovir" }, null]
    const sql = "select publish_product_rebrand($1,$2,$3,$4,$5,$6) as result"
    const [first, replay] = await Promise.all([client.query<{ result: unknown }>(sql, params), second.query<{ result: unknown }>(sql, params)])
    const results = [resultSchema.parse(first.rows[0].result), resultSchema.parse(replay.rows[0].result)]
    assert.deepEqual(results.map(value => value.replayed).sort(), [false,true])
  } finally { await second.end() }
})
test("database: publication history does not break existing admin product deletion", { skip: !enabled }, async () => {
  const version = await seed("db5")
  await publish("db5", version, "database-delete-5", { name: "Dexovir" })
  await client.query("delete from products where id='db5'")
  const { rows } = await client.query<{ count: string }>("select count(*) from product_rebrand_publications where product_id='db5'")
  assert.equal(rows[0].count, "1")
})

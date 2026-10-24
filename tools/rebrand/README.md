# Apindex rebranding with Codex and ImageGen

Codex reads products, inspects their first image, calls its built-in ImageGen tool,
checks the final image and publishes passing results. The runner only prepares and
imports image files; it does not call an image-provider API. No Google credentials
or OpenAI API key are required. Existing Artistly/admin interfaces are unchanged.

## Setup

The existing rebranding migration and the two rebranding API routes must already
be deployed. Do not reapply an installed migration or reset any database.
Use an ignored `.env.local` or `.env` with:

```dotenv
APINDEX_API_BASE_URL=https://www.apindexpharma.com
ARTISTLY_STORE_API_TOKEN=YOUR_EXISTING_STORE_TOKEN
REBRAND_LOGO_PATH="public/apindex-logo (1).webp"
REBRAND_DOMAIN=apindexpharma.com
```

The website keeps the existing Supabase and R2 credentials. The runner uses R2's
public hostname only to validate downloads. Add other trusted image hosts to
`REBRAND_IMAGE_HOSTS` when needed. Never put credentials in prompts or reports.

## Fetch a fixed selection

```text
npm run rebrand -- fetch --all-active --authorization "The user requests automatic rebranding of all active products after Codex verification."
npm run rebrand -- fetch --ids PRODUCT_ID --authorization "The user requests automatic rebranding of this selected product after Codex verification."
```

Record the actual user's scope and authorization; do not invent it. Both commands
print a run ID and product folders under `.cache/rebrand/RUN_UUID/`. The all-active
selection is paginated and checkpointed before downloads, then stays fixed when
the run resumes. Repeat `fetch --run RUN_UUID --all-active` to finish downloads.
Use `--ids` to work on a smaller subset of the saved catalogue.

Codex must open each `original.*`, read `product.json`, and complete
`instructions.json`. Ownership is `wellona`, `other` or `uncertain`; uncertain
ownership is blocked. Set `imageAction: keep` when no image edit is necessary.

For edits, record `editPlan` with `sourceWidth`, `sourceHeight`, `names`, `logos`,
and `protectedRegions`. Rectangles have `left`, `top`, `width`, and `height` in the
original image's pixels. Name rectangles also have the exact `from` and `to` text;
logo rectangles have a sampled `background` hex colour. Include every occurrence.
Bounds and overlap checks reject edits covering protected medicine text/artwork.

Rules:

- Replace only Wellona logos with the exact transparent supplied logo. No extra wording.
- Rename confirmed Wellona names only: Wellovir → Dexovir, Prediwell → Predidex,
  APPETITE-WELL → APPETITE-DEX, and equivalent case-aware Well-to-Dex names.
- Preserve Ascoril, Cipla, Lupin, other brands and ordinary wording such as “well tolerated.”
- With no target domain, use `domainPresent: false` and omit `domains`; add none.
- For an existing Wellona domain, record one `domains.bottomCenter` OR
  `domains.bottomRight` rectangle. Old text moved from elsewhere uses
  `domainRemovals` rectangles and sampled backgrounds. Never add two domains.
- Keep existing correct Apindex domains unchanged and preserve other companies' domains.
- Preserve product handles and medical facts. Exact text-node replacements update
  descriptions, short descriptions and applicable trade-name metadata.

## Prepare → ImageGen → compose

```text
npm run rebrand -- prepare --run RUN_UUID --ids PRODUCT_ID
```

Preparation creates one `imagegen-input.png` context for all pending name edits,
`imagegen-prompt.txt` and `imagegen.json` with its input key. The context is padded
to a square when necessary, so image edges are included. Logo/domain-only edits
are composed locally immediately; text-only work needs no image generation.

Codex must open the clean input with its image-viewing tool, then invoke the
built-in ImageGen skill using that target and the recorded prompt. Do not send an
annotated target, use a CLI/API fallback, or regenerate the complete medicine photo.
Measure the actual call duration and copy/import the returned local output:

```text
npm run rebrand -- compose --run RUN_UUID --ids PRODUCT_ID --image ABSOLUTE_OUTPUT_PATH --input-key PREPARED_INPUT_KEY --elapsed-ms ACTUAL_DURATION
```

The import binds the output to the prepared inputs. Only name rectangles are
copied from ImageGen; everything else in its output is discarded. Sharp places
the exact logo/domain. Lossless PNG output is checked against the decoded source
pixels outside the allowed regions, including small medicine text and artwork.
Default export preserves original dimensions; an explicit `outputScale: 2` uses
an identically resized source as the preservation reference, not AI reconstruction.

Composition produces `candidate.png`, `changes.json` and a pending `review.json`.
Repeating it reuses the exact candidate. Allow at most one focused correction
(two imported tool results per product). To retain a correct name patch while
correcting another, record its SHA-256 in that name rectangle's `reuseImageHash`,
rerun prepare, and inspect the new result. Changed/missing patches are rejected.
Record failed tool calls in the operator's run notes as well; the runner measures
completed imported results and cannot observe calls made outside it.

## Codex verification and automatic publication

Codex must open the original, the exact final upload image and enlarged views of
every edit, then compare `changes.json`. Check spelling, placement, removal of all
targeted Wellona branding, exact logo appearance, other brands, and medical text.
Shifted or unreadable lettering is a failure even when a pixel check passes.

Only after inspection, update `review.json` with `status: passed`, its exact
`candidateHash`, `inspectedBy: codex`, a truthful explanation and all seven checks.
The legacy bottom-center/bottom-right checks mean rule compliance: explain unused
positions as not applicable; they never require two domains. With no source
domain, both checks confirm that none was added. A readable file or HTTP 200 is
not a visual pass. Failed/uncertain products are left unchanged and reported.

```text
npm run rebrand -- publish --run RUN_UUID --ids PRODUCT_ID
npm run rebrand -- status --run RUN_UUID
```

Publishing requires the saved run authorization and a passing hash-bound Codex
review. There is no per-product human approval or fabricated `approval.json`.
Reviews are trusted local operator records, not cryptographic proof of a chat.

The existing API uploads the exact reviewed bytes, atomically saves image/text and
history, leaves a one-image gallery, and refreshes production caches. Text-only
saves preserve image fields. Version conflicts return 412: fetch a fresh run and
inspect again; never edit the expected version to bypass the check.

`publication.json` checkpoints the save before verification. The runner reads back
all changed fields, verifies downloaded image bytes, and confirms the public page
references that image. Repeating publish recovers lost responses or interrupted
verification without another save. A publication with verification pending is
reported separately from a failed unsaved product. Old image files/history remain
available for recovery; the runner never deletes them.

`report.json` contains published, skipped, failed, verification-pending and remaining
counts, reasons, imported ImageGen call counts and measured generation/elapsed time.
Codex processes the saved selection sequentially, publishing one qualifying product
and checking its website result before continuing the catalogue. Built-in ImageGen
needs an active Codex session and available usage; the runner cannot autonomously
call that tool or inspect images. Resume checkpoints when the session is interrupted.

## Existing API contract and tests

- Discovery: `GET /api/artistly/products?status=active&limit=100&cursor=...`.
- Read: `GET /api/rebrand/products/{id}` returns product details and quoted ETag.
  Proxies may return the matching weak form `W/"version"`; the runner checks
  the exact JSON version and uses `"version"` for publication. Other validators
  are rejected, and database version checks remain mandatory.
- Save: `POST /api/rebrand/products/{id}/publish`, multipart JSON `patch` and
  optional `image`, with bearer token, `If-Match` and `X-Idempotency-Key`.
- Images: valid single-frame JPEG/PNG/WebP, maximum 3 MB; full request maximum
  4 MB. No silent lossy compression or resizing to force an oversized upload.

```text
npm run test:rebrand
npm run lint
npm run typecheck
npm run build
```

Database tests run only when `REBRAND_TEST_DATABASE_URL` identifies the dedicated
disposable `rebrand_test` database at `127.0.0.1:65439`. The tests recreate its
schema; never point them at any existing local or production database.

# Apindex product rebranding

Codex inspects and checks images. Only `gemini-2.5-flash-image` generates them.
The local runner never calls a second Gemini model, Cloud Vision or OpenAI's API.
Existing admin forms and Artistly endpoints are unchanged.

## Before / after

Before: use a browser to edit images and save product details separately.
After: fetch through the API, inspect in Codex, generate through Vertex AI, review,
then save the approved image and text together. Product URLs remain unchanged.

## Setup

1. Apply `supabase/migrations/20261013094617_product_rebrand_publications.sql`
   through your normal deployment process and deploy the two new API routes.
   Do not run a blanket database reset or apply unrelated pending migrations.
2. Set `APINDEX_API_BASE_URL`, `ARTISTLY_STORE_API_TOKEN` (the same token configured
   on the website), and the Google credentials below in ignored `.env.local` or `.env`.
   Existing Supabase/R2 credentials remain on the website, not in the API requests.
3. In **My First Project**, enable Vertex AI and give the service account the
   **Vertex AI User** role. If permitted by organisation policy, download its JSON
   key from IAM & Admin → Service Accounts → the account → Keys → Add key.
   Store it outside the repository or in ignored `.cache/rebrand/service-account.json`.
   Configure:
   ```dotenv
   REBRAND_VERTEX_AUTH=service-account
   VERTEX_PROJECT_ID=YOUR_ACTUAL_PROJECT_ID
   VERTEX_LOCATION=global
   GOOGLE_APPLICATION_CREDENTIALS=.cache/rebrand/service-account.json
   ```
   Use the actual project ID from Project settings, not "My First Project".
   The runner requires the key to belong to that same project. It exchanges a
   signed JWT with Google's fixed OAuth endpoint for a short-lived token and
   refreshes it before expiry. Credentials never go into images or reports.
   The project in the request determines the billed project. Available, unexpired
   credits on its linked billing account reduce eligible Vertex AI costs automatically.
   Check Billing → Credits for scope and expiry; installing this code does not prove
   that your particular credits cover the image model.
   To explicitly use the previous Express connection, set `REBRAND_VERTEX_AUTH=express`
   and `VERTEX_EXPRESS_API_KEY`. There is no automatic fallback to Express.
   Image edits call `generateContent` directly; there is no separate access-check request.
4. Defaults: `REBRAND_IMAGE_MODEL=gemini-2.5-flash-image`,
   `REBRAND_LOGO_PATH="public/apindex-logo (1).webp"`, `REBRAND_DOMAIN=apindexpharma.com`.
   Keep the model configurable; Google currently lists retirement on March 15, 2027.
5. For sources outside Wellona/the configured R2 hostname, add exact trusted
   hostnames to `REBRAND_IMAGE_HOSTS`. Redirect destinations also need to be allowed.

There are no new packages. Authentication uses Node's crypto and Google's documented
[service-account OAuth exchange](https://developers.google.com/identity/protocols/oauth2/service-account).
Run commands from the project root.

## Fetch and inspect

```powershell
npm run rebrand -- fetch --ids product_id_1,product_id_2
npm run rebrand -- status --run RUN_UUID
```

The command prints the run ID and absolute product folders under
`.cache/rebrand/RUN_UUID/`. To resume, repeat the command with `--run RUN_UUID`.
Discover IDs using the existing authenticated `GET /api/artistly/products?search=...`
API. Selection is always explicit; there is no automatic whole-catalog operation.

For each product, Codex must **open the original image**, read `product.json`, and
complete `instructions.json` based on what it actually saw:

```json
{
  "ownership": "wellona",
  "imageAction": "edit",
  "wellonaBrandingPresent": true,
  "domainPresent": true,
  "domainPlacementsAlreadyCorrect": false,
  "preserveBrands": ["Cipla", "Lupin"],
  "notes": "Describe the visible logos, brand names, strengths and bottom space.",
  "editPlan": {
    "sourceWidth": 600,
    "sourceHeight": 581,
    "names": [
      { "left": 185, "top": 139, "width": 148, "height": 43, "from": "Chestwell", "to": "Chestdex" }
    ],
    "logos": [
      { "left": 183, "top": 474, "width": 86, "height": 38, "background": "#ffffff" }
    ],
    "domains": {
      "bottomCenter": { "left": 225, "top": 555, "width": 150, "height": 20 }
    },
    "protectedRegions": [
      { "left": 92, "top": 208, "width": 80, "height": 270 }
    ]
  }
}
```

These coordinates illustrate part of the syrup's plan. Codex must measure each
product's actual first image and include **every** visible Wellona logo and name
occurrence, not copy this example. Rectangles use original pixel coordinates.
`protectedRegions` mark medicine text and artwork. Bounds, overlaps, domain positions
and permitted name changes are validated before generation. An edit that cannot fit
without covering information is blocked for review. Omit `editPlan` for `keep`.
Use the supplied transparent logo exactly, without adding separate company wording.
Replace only existing Wellona logos. `domainPresent` means an existing Wellona domain
needs replacement, or an existing Apindex domain is already correct. Preserve other
companies' domains. When no target domain exists, set `domainPresent: false` and omit
`domains`: none is added. When a Wellona domain exists, record exactly one
`bottomCenter` OR `bottomRight` rectangle. Never both. If moving an old domain from
elsewhere, `domainRemovals` records its rectangle and matching background. Omit
`domains` when the existing Apindex placement is already correct. Empty `names`
means no Gemini request is required.

`ownership` is `wellona`, `other` or `uncertain`. Uncertain ownership blocks
preparation. Use `other` to preserve other companies' product names even if they
contain Well. Wellona ownership enables case-aware name/trade-name replacement:
Wellovir → Dexovir; Prediwell → Predidex; APPETITE-WELL → APPETITE-DEX.

`imageAction: keep` is permitted when no Wellona branding remains and any existing
target domain is already correct. Images with no logo/domain do not need added branding. Preserve all other companies'
names, logos and domains. Never cover ingredients or medical text with the domain.

Text changes replace Wellona Pharma with Apindex Pharmaceutics in descriptions and
short descriptions, plus references to the exact renamed trade/product names.
HTML tags/attributes and ordinary wording such as “well tolerated” are preserved.
The trade name is updated within existing metadata without discarding other keys.

## Generate, compare, and record the result

```powershell
npm run rebrand -- generate --run RUN_UUID --ids product_id_1,product_id_2
```

Outputs: `candidate.*`, `changes.json`, and a **pending** `review.json`.
The runner preserves the original composition; export size changes only when an
explicit `outputScale` is recorded. Gemini edits one square context crop
for each trade-name rectangle, with the logo first and target crop last. Only that
name rectangle is copied back; the rest of Gemini's output is discarded. The actual
Apindex logo and any required replacement domain text are composited locally with Sharp. No whole-photo
generation remains. `instructions.json` is the complete edit plan; the actual Gemini
prompts and cached crops are in `name-region-N-prompt.txt` and `name-region-N.png`.
Finished regions resume independently, including after a later region fails.
For a logo/domain-only correction, Codex may retain each already inspected name
patch by recording its SHA-256 in that name rectangle's optional `reuseImageHash`.
The runner checks its bytes and exact dimensions; changed patches are rejected.
This avoids generating unrelated lettering again and still requires a new final review.

Final output is lossless PNG. Optional `editPlan.outputScale: 2` makes a 2x export:
the original photograph is resized normally with Lanczos3 and the supplied logo
is rendered directly at the export resolution, centered with no rotation or skew.
This improves logo rendering, not the actual detail captured in the source medicine
text. For this export the pixel comparison uses the identically resized original
as its reference. Unsupported scales or images over the pixel budget are rejected.
An automatic pixel comparison rejects any change
outside the recorded edit rectangles, including changes to protected medical text.
This confirms preservation, not the correctness of new name lettering: Codex still
visually checks every edited region. Choose the best available original source;
enlarging the image is not treated as recovering unreadable medicine text. There is
no automatic guess of alternate source URLs or AI reconstruction of label text.
Changed logo bytes, model settings or edit instructions invalidate prepared candidates.
If only text needs changing there is no image generation. If nothing changes the
product is skipped. Requests run sequentially with at most three attempts for
temporary errors. Repeating this command resumes already prepared candidates.
Generation only writes local files; it does not upload or update products.

Codex must open both `original.*` and the exact `candidate.*` upload image, compare
them, and review `changes.json`. Update `review.json` only after inspection:

- `status`: `passed`, `needs_review`, or `failed`.
- Retain its exact `candidateHash` and `inspectedBy: codex`.
- Give an accurate `explanation`.
- Record all seven checks: `wellonaRemoved`, `apindexCorrect`,
  `bottomCenterDomain`, `bottomRightDomain`, `otherBrandsPreserved`, `namesCorrect`,
  `medicineTextPreserved`. Passing requires every check to be true. For a
  text-only candidate inspect the unchanged original against these image checks.
  The two legacy domain checks mean compliance at each position: mark the unused
  position true as not applicable and explain it. With no source domain both are
  not applicable, confirming none was added. They never require two domains.

**Never mark a result passed without actually viewing it.** Do not treat an HTTP
200 or a readable image file as a visual pass. Small medicine text can be hard to
verify; leave unclear results `needs_review`. Codex does not guarantee perfect OCR.
Use Codex image/file links to show the user the original, candidate and text changes.

Candidate/image/text/instruction hashes are checked before publishing. Editing a
candidate or the proposed text invalidates the prior inspection. Start a new run
to refresh a stale product; do not edit its source version to bypass the check.
To change instructions, rerun generate and inspect the new candidate.
Old whole-photo candidates are retained as files, but cannot be published through
the new runner. Record a localized edit plan and regenerate them first.

## User approval and publication

For the first **5–6 rounds**, wait for the user's explicit approval naming the
products. Only then create `approval.json` in those product folders:

```json
{
  "approved": true,
  "candidateHash": "COPY_THE_EXACT_HASH_FROM_CHANGES_JSON",
  "reference": "Record the user's explicit approval message and product IDs."
}
```

Do not copy `approval.example.json` as approval without the user's instruction.

```powershell
npm run rebrand -- publish --run RUN_UUID --ids approved_product_id
```

Publishing rejects missing/failed/incomplete reviews and approvals, or changed
candidate files. It uploads the reviewed bytes to R2, then atomically saves the
text, single-image gallery, primary image and thumbnail with a publication record.
Text-only saves preserve the gallery. Old R2 files and full before/after database
records remain available for manual recovery. Unreferenced uploads after a failed
save are not visible in the gallery and can be cleaned up separately.

It reads the product back and verifies its fields and single-image gallery.
`publication.json` is a durable receipt; rerun publish after an interruption to
finish verification. Repeating the exact request cannot save the product twice.
A changed product returns HTTP 412; fetch a new run and review again.

## Later automation through a Codex Goal

Automatic publication is **off by default**, including after six successful rounds.
Only after explicit user authorization may Codex create
`.cache/rebrand/automation.json` containing:

```json
{ "enabled": true, "reference": "The user's explicit authorization to automate." }
```

Then publication can use `--auto-publish`, which replaces per-product user approval
but **never bypasses a passing Codex visual review**. The local files record trusted
local operator decisions; they are not cryptographic proof of a chat message.

A Codex Goal repeats fetch → inspect → generate → compare → publish passed results
→ verify. It depends on an active Codex session and usage limits. The runner alone
cannot inspect images. Keep failed/uncertain products unpublished, and report them.
There is no cloud worker, queue or unattended checking service in this prototype.

## API contract

All requests use `Authorization: Bearer ARTISTLY_STORE_API_TOKEN`.

- `GET /api/rebrand/products/{id}` returns `id`, `handle`, `name`, `description`,
  `shortDescription`, `tradeName`, `imageUrl`, `imageUrls`, `version` and a quoted ETag.
- `POST /api/rebrand/products/{id}/publish` uses multipart `patch` (JSON containing
  only optional `name`, `description`, `shortDescription`, `tradeName`) and optional
  `image` file. Requires the quoted ETag in `If-Match` and an 8–160 character
  alphanumeric/underscore/hyphen `X-Idempotency-Key`.
- Images must be valid single-frame JPEG/PNG/WebP, at most 3 MB. Entire publish
  requests must be at most 4 MB. No silent quality reduction.
- Responses contain `productId`, `handle`, `imageUrl`, `version`, `replayed`.
- 401: unauthorized; 400: invalid data; 404: missing product; 409: reused key with
  different changes; 412: stale product; 428: missing version; 503: save unavailable.

The API trusts its authenticated local operator. Review/approval gates are enforced
by the runner, not by asking the website to perform AI image checks.

## Verification

```powershell
npm run test:rebrand
npm run lint
npm run typecheck
npm run build
```

`database.test.ts` additionally runs real migration/transaction tests only when
`REBRAND_TEST_DATABASE_URL` points to a **disposable** `rebrand_test` database at
`127.0.0.1:65439`. Never point this test suite at a production database.
The suite recreates that database's public schema to make repeated test runs independent.

Before declaring visual acceptance, review examples with Wellona branding, no
Wellona branding, Cipla/Lupin branding, and small medicine text. No live product
publication is authorized by installing this feature.

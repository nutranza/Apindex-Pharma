import { createHash, createPrivateKey, sign } from "node:crypto"
import { readFile } from "node:fs/promises"
import { z } from "zod"

const credentialsSchema = z.object({
  type: z.literal("service_account"),
  project_id: z.string().regex(/^[a-z][a-z0-9-]{4,61}[a-z0-9]$/),
  client_email: z.string().email().endsWith(".iam.gserviceaccount.com"),
  private_key: z.string().min(1),
})
const tokenSchema = z.object({ access_token: z.string().min(1), token_type: z.literal("Bearer"), expires_in: z.number().positive().max(3600) })
const tokenEndpoint = "https://oauth2.googleapis.com/token"
type TokenRequest = (_url: string, _init: RequestInit) => Promise<Response>

// Google's documented OAuth service-account JWT exchange. Never follow URLs from a key file.
export async function serviceAccountToken(value: unknown, request: TokenRequest, now = Date.now()): Promise<{ token: string; expiresAt: number }> {
  const key = credentialsSchema.parse(value)
  const issuedAt = Math.floor(now / 1000)
  const encode = (data: object) => Buffer.from(JSON.stringify(data)).toString("base64url")
  const unsigned = `${encode({ alg: "RS256", typ: "JWT" })}.${encode({
    iss: key.client_email, scope: "https://www.googleapis.com/auth/cloud-platform",
    aud: tokenEndpoint, iat: issuedAt, exp: issuedAt + 3600,
  })}`
  const privateKey = createPrivateKey(key.private_key)
  if (privateKey.asymmetricKeyType !== "rsa") throw new Error("Service-account key must use RSA.")
  const assertion = `${unsigned}.${sign("RSA-SHA256", Buffer.from(unsigned), privateKey).toString("base64url")}`
  const response = await request(tokenEndpoint, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }).toString() })
  if (!response.ok) throw new Error("Service-account authentication failed.")
  const token = tokenSchema.parse(await response.json())
  return { token: token.access_token, expiresAt: now + token.expires_in * 1000 }
}

let cached: { fingerprint: string; token: string; expiresAt: number } | undefined

export async function vertexConnection(model: string, request: TokenRequest): Promise<{ endpoint: string; headers: Record<string, string> }> {
  const mode = process.env.REBRAND_VERTEX_AUTH || "service-account"
  if (mode === "express") {
    const key = process.env.VERTEX_EXPRESS_API_KEY
    if (!key) throw new Error("Configure VERTEX_EXPRESS_API_KEY before generation.")
    return { endpoint: `https://aiplatform.googleapis.com/v1/publishers/google/models/${model}`,
      headers: { "Content-Type": "application/json", "x-goog-api-key": key } }
  }
  if (mode !== "service-account") throw new Error("REBRAND_VERTEX_AUTH must be service-account or express.")
  const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  const project = process.env.VERTEX_PROJECT_ID
  const location = process.env.VERTEX_LOCATION || "global"
  if (!keyPath || !project) throw new Error("Configure GOOGLE_APPLICATION_CREDENTIALS and VERTEX_PROJECT_ID.")
  if (!/^[a-z][a-z0-9-]{4,61}[a-z0-9]$/.test(project) || !/^(global|[a-z]+-[a-z]+[0-9])$/.test(location)) throw new Error("Invalid Vertex project or location.")
  let key: z.infer<typeof credentialsSchema>
  try { key = credentialsSchema.parse(JSON.parse(await readFile(keyPath, "utf8"))) } catch { throw new Error("Cannot read a valid service-account JSON key.") }
  if (key.project_id !== project) throw new Error("The service-account key must belong to VERTEX_PROJECT_ID. Check the project ID, not its display name.")
  const fingerprint = createHash("sha256").update(JSON.stringify(key)).digest("hex")
  if (!cached || cached.fingerprint !== fingerprint || cached.expiresAt <= Date.now() + 60_000) {
    try { cached = { fingerprint, ...await serviceAccountToken(key, request) } } catch { throw new Error("Service-account authentication failed. Check the key and Google Cloud permissions.") }
  }
  const host = location === "global" ? "aiplatform.googleapis.com" : `${location}-aiplatform.googleapis.com`
  return { endpoint: `https://${host}/v1/projects/${project}/locations/${location}/publishers/google/models/${model}`,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${cached.token}` } }
}

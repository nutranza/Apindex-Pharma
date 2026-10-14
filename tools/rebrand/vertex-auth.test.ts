import { test } from "node:test"
import assert from "node:assert/strict"
import { generateKeyPairSync, verify } from "node:crypto"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { serviceAccountToken, vertexConnection } from "./vertex-auth"

test("service-account OAuth assertion is signed and only sent to Google's token endpoint", async () => {
  const pair = generateKeyPairSync("rsa", { modulusLength: 2048 })
  const key = { type: "service_account", project_id: "test-project", client_email: "runner@test-project.iam.gserviceaccount.com",
    private_key: pair.privateKey.export({ type: "pkcs8", format: "pem" }).toString(), token_uri: "https://evil.example/token" }
  const token = await serviceAccountToken(key, async (url, init) => {
    assert.equal(url, "https://oauth2.googleapis.com/token")
    assert.equal(typeof init.body, "string")
    if (typeof init.body !== "string") throw new Error("Expected form body")
    const assertion = new URLSearchParams(init.body).get("assertion")
    assert.ok(assertion)
    const [header, claims, signature] = assertion.split(".")
    assert.equal(verify("RSA-SHA256", Buffer.from(`${header}.${claims}`), pair.publicKey, Buffer.from(signature, "base64url")), true)
    assert.deepEqual(JSON.parse(Buffer.from(claims, "base64url").toString()), {
      iss: key.client_email, scope: "https://www.googleapis.com/auth/cloud-platform",
      aud: url, iat: 1000, exp: 4600,
    })
    return Response.json({ access_token: "test-token", token_type: "Bearer", expires_in: 3600 })
  }, 1_000_000)
  assert.deepEqual(token, { token: "test-token", expiresAt: 4_600_000 })
  await assert.rejects(serviceAccountToken({ ...key, type: "authorized_user" }, async () => { throw new Error("Must not send") }))
  await assert.rejects(serviceAccountToken(key, async () => Response.json({ error: "invalid_grant" }, { status: 400 })), /authentication failed/)
})

test("unknown authentication modes are rejected without network requests", async () => {
  const previous = process.env.REBRAND_VERTEX_AUTH
  try {
    process.env.REBRAND_VERTEX_AUTH = "automatic-fallback"
    await assert.rejects(vertexConnection("gemini-2.5-flash-image", async () => { throw new Error("Must not send") }), /must be service-account or express/)
  } finally {
    if (previous === undefined) delete process.env.REBRAND_VERTEX_AUTH
    else process.env.REBRAND_VERTEX_AUTH = previous
  }
})

test("project authentication uses bearer tokens, caches them and rejects a different billing project", async () => {
  const names = ["REBRAND_VERTEX_AUTH", "VERTEX_PROJECT_ID", "VERTEX_LOCATION", "GOOGLE_APPLICATION_CREDENTIALS"] as const
  const previous = names.map(name => process.env[name])
  const pair = generateKeyPairSync("rsa", { modulusLength: 2048 })
  const folder = path.resolve(".cache/rebrand-auth-tests")
  await mkdir(folder, { recursive: true })
  const keyPath = path.join(folder, "fake-service-account.json")
  await writeFile(keyPath, JSON.stringify({ type: "service_account", project_id: "test-project", client_email: "runner@test-project.iam.gserviceaccount.com",
    private_key: pair.privateKey.export({ type: "pkcs8", format: "pem" }).toString() }))
  try {
    process.env.REBRAND_VERTEX_AUTH = "service-account"
    process.env.VERTEX_PROJECT_ID = "test-project"
    process.env.VERTEX_LOCATION = "global"
    process.env.GOOGLE_APPLICATION_CREDENTIALS = keyPath
    let requests = 0
    const request = async () => { requests++; return Response.json({ access_token: "local-test-token", token_type: "Bearer", expires_in: 3600 }) }
    const result = await vertexConnection("gemini-2.5-flash-image", request)
    assert.equal(result.endpoint, "https://aiplatform.googleapis.com/v1/projects/test-project/locations/global/publishers/google/models/gemini-2.5-flash-image")
    assert.equal(result.headers.Authorization, "Bearer local-test-token")
    assert.equal(result.headers["x-goog-api-key"], undefined)
    await vertexConnection("gemini-2.5-flash-image", request)
    assert.equal(requests, 1)
    process.env.VERTEX_PROJECT_ID = "wrong-project"
    await assert.rejects(vertexConnection("gemini-2.5-flash-image", request), /must belong/)
    assert.equal(requests, 1)
    process.env.REBRAND_VERTEX_AUTH = "express"
    const expressKey = process.env.VERTEX_EXPRESS_API_KEY
    try {
      process.env.VERTEX_EXPRESS_API_KEY = "test-express-key"
      const express = await vertexConnection("gemini-2.5-flash-image", request)
      assert.equal(express.headers["x-goog-api-key"], "test-express-key")
      assert.equal(express.headers.Authorization, undefined)
    } finally {
      if (expressKey === undefined) delete process.env.VERTEX_EXPRESS_API_KEY
      else process.env.VERTEX_EXPRESS_API_KEY = expressKey
    }
  } finally {
    names.forEach((name, index) => {
      if (previous[index] === undefined) delete process.env[name]
      else process.env[name] = previous[index]
    })
  }
})

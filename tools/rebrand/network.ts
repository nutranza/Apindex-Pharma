import { lookup } from "node:dns/promises"
import { BlockList, isIP } from "node:net"
import { setTimeout as delay } from "node:timers/promises"
import { z } from "zod"
import { vertexConnection } from "./vertex-auth"

export class HttpError extends Error {
  constructor(readonly status: number) { super(`Request failed (HTTP ${status}).`) }
}

export async function readBytes(response: Response, maximum: number): Promise<Buffer> {
  if (!response.body) throw new Error("Empty response.")
  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  try {
    for (;;) {
      const chunk = await reader.read()
      if (chunk.done) break
      size += chunk.value.length
      if (size > maximum) { await reader.cancel(); throw new Error("Response exceeds the allowed size.") }
      chunks.push(chunk.value)
    }
  } finally { reader.releaseLock() }
  return Buffer.concat(chunks)
}

export async function request(url: string | URL, init: RequestInit, timeout = 60_000): Promise<Response> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, { ...init, redirect: "error", signal: AbortSignal.timeout(timeout) })
      if (!response.ok) { await response.body?.cancel(); throw new HttpError(response.status) }
      return response
    } catch (error) {
      if (error instanceof HttpError && error.status !== 429 && error.status < 500) throw error
      if (attempt === 2) throw error instanceof HttpError ? error : new Error("Network request failed or timed out after three attempts.")
      await delay(1000 * 2 ** attempt + Math.floor(Math.random() * 500))
    }
  }
  throw new Error("Request failed.")
}

const blocked = new BlockList()
for (const [ip, prefix] of [["0.0.0.0", 8], ["10.0.0.0", 8], ["127.0.0.0", 8], ["169.254.0.0", 16], ["172.16.0.0", 12], ["192.168.0.0", 16], ["100.64.0.0", 10], ["192.0.0.0", 24], ["198.18.0.0", 15], ["224.0.0.0", 4], ["240.0.0.0", 4]] as const) blocked.addSubnet(ip, prefix, "ipv4")
for (const [ip, prefix] of [["::", 128], ["::1", 128], ["fc00::", 7], ["fe80::", 10], ["ff00::", 8], ["2001:db8::", 32]] as const) blocked.addSubnet(ip, prefix, "ipv6")

export function isPrivateAddress(address: string): boolean {
  const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/i.exec(address)?.[1]
  if (mapped) return isPrivateAddress(mapped)
  return blocked.check(address, isIP(address) === 4 ? "ipv4" : "ipv6")
}

export async function downloadImage(url: string): Promise<Buffer> {
  let target = new URL(url)
  for (let redirects = 0; redirects <= 3; redirects++) {
    if (target.protocol !== "https:" || target.username || target.password || isIP(target.hostname)) throw new Error("Images must use a public HTTPS hostname.")
    const addresses = await lookup(target.hostname, { all: true })
    if (!addresses.length || addresses.some(value => isPrivateAddress(value.address))) throw new Error("Private image hosts are not allowed.")
    // DNS is also restricted by a hostname allowlist to prevent arbitrary remote hosts.
    const allowed = ["wellonapharma.com", "www.wellonapharma.com", ...((process.env.REBRAND_IMAGE_HOSTS ?? "").split(",").filter(Boolean))]
    if (process.env.NEXT_PUBLIC_R2_PUBLIC_URL) allowed.push(new URL(process.env.NEXT_PUBLIC_R2_PUBLIC_URL).hostname)
    if (!allowed.includes(target.hostname)) throw new Error(`Image host ${target.hostname} must be explicitly allowed in REBRAND_IMAGE_HOSTS.`)
    const response = await fetch(target, { redirect: "manual", signal: AbortSignal.timeout(45_000) })
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location")
      await response.body?.cancel()
      if (!location || redirects === 3) throw new Error("Too many image redirects.")
      target = new URL(location, target)
      continue
    }
    if (!response.ok) { await response.body?.cancel(); throw new HttpError(response.status) }
    return readBytes(response, 7 * 1024 * 1024)
  }
  throw new Error("Image download failed.")
}

const geminiSchema = z.object({
  candidates: z.array(z.object({
    finishReason: z.string().optional(),
    content: z.object({ parts: z.array(z.object({
      text: z.string().optional(),
      inlineData: z.object({ mimeType: z.enum(["image/png", "image/jpeg", "image/webp"]), data: z.string().min(1) }).optional(),
    })) }).optional(),
  })).optional(),
})

export function extractGeneratedImage(value: unknown): Buffer {
  const response = geminiSchema.parse(value)
  if (response.candidates?.length !== 1) throw new Error("Gemini did not return exactly one candidate. Review the request.")
  const candidate = response.candidates[0]
  if (candidate.finishReason && candidate.finishReason !== "STOP") throw new Error("Gemini returned an incomplete or blocked result.")
  const images = candidate.content?.parts.flatMap(part => part.inlineData ? [part.inlineData] : []) ?? []
  if (images.length !== 1) throw new Error("Gemini did not return exactly one image. No candidate can be published.")
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(images[0].data)) throw new Error("Invalid generated image encoding.")
  return Buffer.from(images[0].data, "base64")
}

export async function generateImage(original: Buffer, originalMime: string, logo: Buffer, logoMime: string, prompt: string): Promise<Buffer> {
  const model = process.env.REBRAND_IMAGE_MODEL || "gemini-2.5-flash-image"
  if (!/^[a-zA-Z0-9.-]+$/.test(model)) throw new Error("Invalid model ID.")
  const { endpoint, headers } = await vertexConnection(model, request)
  const contents = [{ role: "user", parts: [
    { text: prompt },
    { inlineData: { mimeType: logoMime, data: logo.toString("base64") } },
    { inlineData: { mimeType: originalMime, data: original.toString("base64") } },
  ] }]
  const response = await request(`${endpoint}:generateContent`, { method: "POST", headers,
    body: JSON.stringify({ contents, generationConfig: { responseModalities: ["TEXT", "IMAGE"] } }) }, 180_000)
  const value: unknown = JSON.parse((await readBytes(response, 24 * 1024 * 1024)).toString("utf8"))
  return extractGeneratedImage(value)
}

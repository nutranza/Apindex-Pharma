import { lookup } from "node:dns/promises"
import { BlockList, isIP } from "node:net"
import { setTimeout as delay } from "node:timers/promises"

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
      if (!response.ok) {
        const retryAfter = response.headers.get("retry-after")
        await response.body?.cancel()
        if ((response.status === 429 || response.status === 503) && retryAfter && attempt < 2) {
          const seconds = Number(retryAfter)
          const wait = Number.isFinite(seconds) ? seconds * 1000 : Date.parse(retryAfter) - Date.now()
          if (wait > 0 && wait <= 60_000) await delay(wait)
        }
        throw new HttpError(response.status)
      }
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

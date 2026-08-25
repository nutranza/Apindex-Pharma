import "server-only"

import { timingSafeEqual } from "node:crypto"

export type ArtistlyImageMode =
  | "replace-primary"
  | "keep-both"
  | "replace-all"

export type ArtistlyProductRow = {
  id: string
  name: string
  handle: string
  status: "active" | "draft" | "archived"
  image_url: string | null
  thumbnail: string | null
  images: string[] | null
  updated_at: string
}

export function requireArtistlyToken(request: Request): void {
  const configuredToken = process.env.ARTISTLY_STORE_API_TOKEN
  const authorization = request.headers.get("authorization")
  const providedToken = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : ""

  if (!configuredToken || !providedToken || !tokensMatch(providedToken, configuredToken)) {
    throw new ArtistlyApiError("Unauthorized.", 401)
  }
}

export function readImageMode(value: FormDataEntryValue | null): ArtistlyImageMode {
  if (value === "replace-primary" || value === "keep-both" || value === "replace-all") {
    return value
  }

  throw new ArtistlyApiError("Choose a valid image replacement mode.", 400)
}

function tokensMatch(providedToken: string, configuredToken: string): boolean {
  const provided = Buffer.from(providedToken)
  const configured = Buffer.from(configuredToken)

  return provided.length === configured.length && timingSafeEqual(provided, configured)
}

export class ArtistlyApiError extends Error {
  readonly status: number

  constructor(
    message: string,
    status: number,
  ) {
    super(message)
    this.name = "ArtistlyApiError"
    this.status = status
  }
}

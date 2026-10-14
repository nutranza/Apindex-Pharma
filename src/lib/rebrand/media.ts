import sharp from "sharp"
import { MAX_IMAGE_BYTES } from "./contracts"

export async function inspectImage(bytes: Uint8Array, maxBytes = MAX_IMAGE_BYTES): Promise<{ mimeType: string; extension: string }> {
  if (!bytes.length || bytes.length > maxBytes) throw new Error("Image is empty or exceeds the allowed size. Do not silently reduce readability.")
  const image = sharp(Buffer.from(bytes), { limitInputPixels: 40_000_000, failOn: "warning" })
  const metadata = await image.metadata()
  const format = metadata.format
  if (!metadata.width || !metadata.height || (metadata.pages ?? 1) !== 1 || (format !== "jpeg" && format !== "png" && format !== "webp")) {
    throw new Error("Only valid, single-frame JPEG, PNG and WebP images are supported.")
  }
  // Decode pixels as well: metadata alone accepts some truncated image files.
  await image.stats()
  return { mimeType: `image/${format}`, extension: format === "jpeg" ? "jpg" : format }
}

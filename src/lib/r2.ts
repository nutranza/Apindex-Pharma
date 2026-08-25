import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"

export const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_KEY!,
  },
})

export const getFileUrl = (key: string) => {
  const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || ""
  return `${publicUrl}/${key}`
}

export async function uploadFileBytes(input: {
  key: string
  bytes: Uint8Array
  contentType: string
}): Promise<string> {
  await r2Client.send(
    new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET!,
      Key: input.key,
      Body: input.bytes,
      ContentType: input.contentType,
      CacheControl: "public, max-age=31536000, immutable",
    })
  )

  return getFileUrl(input.key)
}

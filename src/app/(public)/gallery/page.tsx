import type { Metadata } from "next"
import { listPublicCatalogProducts } from "@/lib/data/public-catalog"
import GalleryPageTemplate from "@/modules/gallery/templates/gallery-page"

export const metadata: Metadata = {
  title: "Gallery",
  description: "View our Apindex pharmaceutical product gallery.",
}

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>
}) {
  const resolvedSearchParams = await searchParams
  const page = Number.parseInt(resolvedSearchParams.page ?? "1", 10)

  const catalog = await listPublicCatalogProducts({
    page: Number.isNaN(page) ? 1 : page,
    pageSize: 36, // Load more images for gallery view
    mode: "media",
  })

  return <GalleryPageTemplate catalog={catalog} />
}

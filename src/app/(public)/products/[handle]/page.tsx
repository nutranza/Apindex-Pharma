import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { getPublicProductDetailByHandle } from "@/lib/data/public-product-detail"
import { getProductSummary } from "@/modules/products/lib/product-detail-ui"
import ProductDetailPageTemplate from "@/modules/products/templates/product-detail-page"

export const revalidate = 300

type ProductDetailPageProps = {
  params: Promise<{ handle: string }>
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { handle } = await params
  const product = await getPublicProductDetailByHandle(handle)

  if (!product) {
    return {
      title: "Product Not Found",
      description: "The requested Apindex product could not be found.",
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const title = product.seo_title?.trim() || `${product.name} | Apindex`
  const description = product.seo_description?.trim() || getProductSummary(product)

  return {
    title,
    description,
    robots: product.noIndex
      ? {
          index: false,
          follow: false,
        }
      : undefined,
    openGraph: {
      title: product.ogTitle || title,
      description: product.ogDescription || description,
      images: product.image_url
        ? [
            {
              url: product.image_url,
              alt: product.name,
            },
          ]
        : undefined,
    },
  }
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { handle } = await params
  const product = await getPublicProductDetailByHandle(handle)

  if (!product) {
    notFound()
  }

  return <ProductDetailPageTemplate product={product} />
}

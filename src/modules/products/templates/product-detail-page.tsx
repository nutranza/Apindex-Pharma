import type { PublicProductDetail } from "@/lib/data/public-product-detail"
import ProductBreadcrumbsSection from "@/modules/products/sections/product-breadcrumbs-section"
import ProductDetailContentSection from "@/modules/products/sections/product-detail-content-section"
import ProductHeroSection from "@/modules/products/sections/product-hero-section"

type ProductDetailPageTemplateProps = {
  product: PublicProductDetail
}

export default function ProductDetailPageTemplate({
  product,
}: ProductDetailPageTemplateProps) {
  return (
    <div className="apx-landing apx-font-body min-h-screen bg-white text-on-surface">
      <main className="!pb-0 pt-20 md:pt-24">
        <ProductBreadcrumbsSection product={product} />
        <ProductHeroSection product={product} />
        <ProductDetailContentSection product={product} />
      </main>
    </div>
  )
}


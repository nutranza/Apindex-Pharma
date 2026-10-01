import type { PublicCatalogResult } from "@/lib/data/public-catalog"
import ProductsCatalogSection from "@/modules/products/sections/products-catalog-section"
import ProductsHeroSection from "@/modules/products/sections/products-hero-section"

type ProductsPageTemplateProps = {
  catalog: PublicCatalogResult
  initialCategoryHandle?: string | null
  initialDosageForm?: string | null
  initialSubcategoryLabel?: string | null
}

export default function ProductsPageTemplate({
  catalog,
  initialCategoryHandle = null,
  initialDosageForm = null,
  initialSubcategoryLabel = null,
}: ProductsPageTemplateProps) {
  return (
    <div className="apx-landing apx-font-body min-h-screen bg-surface text-on-surface">
      <main className="!pb-0">
        <ProductsHeroSection />
        <ProductsCatalogSection
          catalog={catalog}
          initialCategoryHandle={initialCategoryHandle}
          initialDosageForm={initialDosageForm}
          initialSubcategoryLabel={initialSubcategoryLabel}
        />
      </main>
    </div>
  )
}

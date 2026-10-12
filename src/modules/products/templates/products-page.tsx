import type { ReactNode } from "react"
import ProductsHeroSection from "@/modules/products/sections/products-hero-section"

export default function ProductsPageTemplate({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="apx-landing apx-font-body min-h-screen bg-surface text-on-surface">
      <main className="!pb-0">
        <ProductsHeroSection />
        {children}
      </main>
    </div>
  )
}

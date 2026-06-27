import Link from "next/link"
import { HiOutlineChevronRight } from "react-icons/hi2"

import type { PublicProductDetail } from "@/lib/data/public-product-detail"

type ProductBreadcrumbsSectionProps = {
  product: PublicProductDetail
}

export default function ProductBreadcrumbsSection({
  product,
}: ProductBreadcrumbsSectionProps) {
  return (
    <section className="content-container pt-5 md:pt-6">
      <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold text-on-surface-variant">
        <Link href="/" className="transition-colors">
          Home
        </Link>
        <HiOutlineChevronRight className="text-sm" />
        <Link
          href="/products"
          className="transition-colors"
        >
          Products
        </Link>
        <HiOutlineChevronRight className="text-sm" />
        <span className="text-on-surface font-bold">{product.name}</span>
      </nav>
    </section>
  )
}

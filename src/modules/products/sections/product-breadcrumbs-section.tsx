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
      <nav className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant md:text-[11px]">
        <Link href="/" className="transition-colors hover:text-primary">
          Home
        </Link>
        <HiOutlineChevronRight className="text-sm" />
        <Link
          href="/products"
          className="transition-colors hover:text-primary"
        >
          Products
        </Link>
        <HiOutlineChevronRight className="text-sm" />
        <span className="text-on-surface">{product.name}</span>
      </nav>
    </section>
  )
}

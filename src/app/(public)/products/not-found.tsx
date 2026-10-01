import Link from "next/link"

import SectionBadge from "@/modules/common/components/section-badge"

export default function ProductsNotFound() {
  return (
    <div className="apx-landing apx-font-body min-h-screen bg-surface text-on-surface">
      <main className="!pb-0 pt-20">
        <section className="content-container flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
          <div className="mb-4">
            <SectionBadge tone="primary">Product Not Found</SectionBadge>
          </div>
          <h1 className="apx-page-heading tracking-tight">
            This product is not available in the public catalog.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-on-surface-variant">
            The product may be inactive, archived, or the link may be incorrect. Browse the
            current product catalog to review the available pharmaceutical entries.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/products"
              className="apx-button-primary"
            >
              Back to Products
            </Link>
            <Link
              href="/"
              className="apx-button-outline text-primary hover:text-primary"
            >
              Return Home
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}

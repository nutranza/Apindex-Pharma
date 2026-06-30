import Link from "next/link"

import type { PublicProductDetail } from "@/lib/data/public-product-detail"
import ProductImageGallery from "@/modules/products/components/product-image-gallery"
import {
  buildProductDetailEnquiryHref,
  buildProductHeadline,
  getProductDescriptionHtml,
  getProductDescriptionParagraphs,
} from "@/modules/products/lib/product-detail-ui"

type ProductDetailContentSectionProps = {
  product: PublicProductDetail
}

type DetailRow = {
  label: string
  value: string
}

function buildDetailRows(product: PublicProductDetail): DetailRow[] {
  const details = product.pharmaDetails
  const therapeuticUse =
    details?.therapeuticUse ||
    (product.categories.length > 0
      ? product.categories.map((category) => category.name).join(", ")
      : null)

  const rows: Array<DetailRow | null> = [
    { label: "Product Name", value: product.name },
    details?.tradeName
      ? { label: "Trade Name", value: details.tradeName }
      : null,
    details?.availableStrength
      ? { label: "Available Strength", value: details.availableStrength }
      : null,
    details?.availableCombination
      ? { label: "Available Combination", value: details.availableCombination }
      : null,
    details?.packing ? { label: "Packing", value: details.packing } : null,
    details?.packInsertLeaflet !== null &&
    details?.packInsertLeaflet !== undefined
      ? {
          label: "Pack Insert / Leaflet",
          value: details.packInsertLeaflet ? "Yes" : "No",
        }
      : null,
    therapeuticUse ? { label: "Therapeutic Use", value: therapeuticUse } : null,
    details?.productionCapacity
      ? { label: "Production Capacity", value: details.productionCapacity }
      : null,
  ]

  return rows.filter((row): row is DetailRow => Boolean(row))
}

export default function ProductDetailContentSection({
  product,
}: ProductDetailContentSectionProps) {
  const headline = buildProductHeadline(product.name)
  const detailRows = buildDetailRows(product)
  const descriptionHtml = getProductDescriptionHtml(product)
  const descriptionParagraphs = descriptionHtml
    ? null
    : getProductDescriptionParagraphs(product)
  const hasDescription =
    Boolean(descriptionHtml) ||
    Boolean(descriptionParagraphs && descriptionParagraphs.length > 0)
  const selectedCategoryHandle = product.categories[0]?.handle ?? null
  const galleryImages = Array.from(
    new Set([product.image_url, ...product.images].filter(Boolean))
  ) as string[]

  return (
    <section className="content-container py-10 lg:py-14">
      <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="self-start overflow-hidden border border-gray-200 bg-white">
          <h2 className="bg-gray-50 px-5 py-6 text-center text-2xl font-semibold text-primary">
            Category
          </h2>
          <nav
            aria-label="Therapeutic categories"
            className="max-h-[720px] overflow-y-auto"
          >
            <Link
              href="/products"
              className={`block border-t border-gray-200 px-5 py-3 text-sm transition-colors ${
                selectedCategoryHandle
                  ? "bg-white text-on-surface hover:bg-gray-50"
                  : "bg-secondary text-white"
              }`}
            >
              All
            </Link>

            {product.catalogCategories.map((category) => {
              const isSelected = category.handle === selectedCategoryHandle

              return (
                <Link
                  key={category.id}
                  href={`/products?category=${encodeURIComponent(
                    category.handle
                  )}`}
                  className={`block border-t border-gray-200 px-5 py-3 text-sm transition-colors ${
                    isSelected
                      ? "bg-secondary text-white"
                      : "bg-white text-on-surface hover:bg-gray-50"
                  }`}
                >
                  {category.name}
                </Link>
              )
            })}
          </nav>
        </aside>

        <div className="min-w-0">
          <div className="grid gap-8 lg:grid-cols-[minmax(300px,0.95fr)_minmax(320px,1fr)] xl:gap-10">
            <ProductImageGallery
              productName={product.name}
              images={galleryImages}
            />

            <div className="min-w-0">
              <h1 className="apx-font-headline text-2xl font-semibold leading-tight text-secondary md:text-3xl">
                {headline.primary}
                {headline.accent ? (
                  <>
                    {" "}
                    <span className="text-primary">{headline.accent}</span>
                  </>
                ) : null}
              </h1>

              <div className="mt-4 border-t border-gray-200">
                {detailRows.map((row) => (
                  <div
                    key={row.label}
                    className="border-b border-gray-200 py-3 text-sm leading-6 text-on-surface"
                  >
                    <span className="font-semibold">{row.label} : </span>
                    <span>{row.value}</span>
                  </div>
                ))}
              </div>

              <a
                href={buildProductDetailEnquiryHref(product)}
                className="mt-6 inline-flex min-h-[46px] items-center justify-center bg-secondary px-7 py-3 text-center text-sm font-bold uppercase tracking-[0.02em] text-white transition-colors hover:bg-on-secondary-container"
              >
                Inquire About {product.name}
              </a>
            </div>
          </div>

          {hasDescription ? (
            <div className="mt-10 max-w-5xl">
              <h2 className="mb-4 text-2xl font-semibold text-secondary">
                Description
              </h2>

              {descriptionHtml ? (
                <div
                  className="rich-text-block max-w-none text-sm text-on-surface"
                  dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                />
              ) : (
                <div className="space-y-4 text-sm leading-7 text-on-surface">
                  {descriptionParagraphs!.map((paragraph, index) => (
                    <p key={`${product.id}-paragraph-${index + 1}`}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ) : null}

        </div>
      </div>
    </section>
  )
}

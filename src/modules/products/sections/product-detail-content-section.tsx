import type { PublicProductDetail } from "@/lib/data/public-product-detail"
import ProductImageGallery from "@/modules/products/components/product-image-gallery"
import {
  buildProductDetailQuoteHref,
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
  const detailRows = buildDetailRows(product)
  const descriptionHtml = getProductDescriptionHtml(product)
  const descriptionParagraphs = descriptionHtml
    ? null
    : getProductDescriptionParagraphs(product)
  const hasDescription =
    Boolean(descriptionHtml) ||
    Boolean(descriptionParagraphs && descriptionParagraphs.length > 0)
  const galleryImages = Array.from(
    new Set([product.image_url, ...product.images].filter(Boolean))
  ) as string[]

  return (
    <section className="content-container py-10 lg:py-14">
      <div className="min-w-0">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] xl:gap-12">
          <ProductImageGallery
            productName={product.name}
            images={galleryImages}
          />

          <div className="min-w-0 rounded-3xl border border-outline-variant/25 bg-white p-6 shadow-[0_18px_45px_rgba(86,67,54,0.08)] sm:p-8">
            <h1 className="apx-font-headline text-xl font-semibold leading-tight text-on-surface md:text-2xl">
              {product.name}
            </h1>

            <div className="mt-7 divide-y divide-outline-variant/25 border-y border-outline-variant/25">
              {detailRows.map((row) => (
                <div
                  key={row.label}
                  className="grid gap-1 py-3.5 text-sm leading-6 text-on-surface sm:grid-cols-[minmax(130px,0.38fr)_minmax(0,1fr)] sm:gap-5"
                >
                  <span className="font-semibold text-on-surface-variant">
                    {row.label}
                  </span>
                  <span>{row.value}</span>
                </div>
              ))}
            </div>

            <a
              href={buildProductDetailQuoteHref(product)}
              className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-secondary px-7 py-3 text-center text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-on-secondary-container hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-secondary/25"
            >
              Get a Quote
            </a>
          </div>
        </div>

        {hasDescription ? (
          <div className="mt-10 rounded-3xl border border-outline-variant/25 bg-white p-6 shadow-[0_14px_36px_rgba(86,67,54,0.06)] sm:p-8 lg:mt-12">
            <h2 className="mb-5 text-2xl font-semibold text-secondary">
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
    </section>
  )
}

import type { PublicProductDetail } from "@/lib/data/public-product-detail"
import { FaWhatsapp } from "react-icons/fa6"
import { FileText } from "lucide-react"
import { WHATSAPP_URL } from "@/modules/layout/public/constants"
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
  const whatsappMessage = `Hello Apindex Pharma, I would like to enquire about ${product.name}. Please share your quotation and COA.`
  const whatsappHref = `${WHATSAPP_URL}?text=${encodeURIComponent(whatsappMessage)}`
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
    <section className="content-container apx-section-compact">
      <div className="min-w-0">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] xl:gap-12">
          <ProductImageGallery
            productName={product.name}
            images={galleryImages}
          />

          <div className="apx-card min-w-0 p-6 shadow-sm sm:p-8">
            <h1 className="apx-card-title md:text-2xl">
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

            <div className="mt-7 grid gap-3">
              <a
                href={buildProductDetailQuoteHref(product)}
                className="apx-button-secondary w-full min-h-12 px-7"
              >
                Get a Quote
              </a>
              <div className="grid gap-3 sm:grid-cols-2">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-[#1ebe5d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
                >
                  <FaWhatsapp aria-hidden="true" className="size-5 shrink-0" />
                  Enquire on WhatsApp
                </a>
                <a
                  href="/assets/pdf/Apindex-Pharma-MOQ.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="apx-button-primary min-h-12 gap-2 px-4"
                  aria-label="Check MOQ (PDF, opens in a new tab)"
                >
                  <FileText aria-hidden="true" className="size-5 shrink-0" />
                  Check MOQ
                </a>
              </div>
            </div>
          </div>
        </div>

        {hasDescription ? (
          <div className="apx-card mt-10 p-6 shadow-sm sm:p-8 lg:mt-12">
            <h2 className="mb-5 apx-card-title text-secondary">
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

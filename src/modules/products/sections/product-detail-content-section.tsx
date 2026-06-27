import type { PublicProductDetail } from "@/lib/data/public-product-detail"
import {
  getProductDescriptionHtml,
  getProductDescriptionParagraphs,
} from "@/modules/products/lib/product-detail-ui"

type ProductDetailContentSectionProps = {
  product: PublicProductDetail
}

export default function ProductDetailContentSection({
  product,
}: ProductDetailContentSectionProps) {
  const descriptionHtml = getProductDescriptionHtml(product)
  const descriptionParagraphs = descriptionHtml
    ? null
    : getProductDescriptionParagraphs(product)

  return (
    <section className="content-container mb-5">
      <div className="max-w-4xl">
        <div className="mb-8">
          <h2 className="apx-font-headline text-2xl font-semibold text-on-surface md:text-4xl">
            Product Information
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-on-surface-variant md:text-base">
            Review the available product details, usage notes, and supporting
            information for institutional and export enquiries.
          </p>
        </div>

        {descriptionHtml ? (
          <div
            className="rich-text-block max-w-none text-base leading-8 text-on-surface-variant md:text-lg"
            dangerouslySetInnerHTML={{ __html: descriptionHtml }}
          />
        ) : (
          <div className="space-y-4 font-medium text-base leading-8 text-on-surface-variant md:text-lg">
            {descriptionParagraphs!.map((paragraph, index) => (
              <p key={`${product.id}-paragraph-${index + 1}`}>{paragraph}</p>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

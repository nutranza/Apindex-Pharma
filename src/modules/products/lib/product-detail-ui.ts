import type { PublicProductDetail } from "@/lib/data/public-product-detail"

const CONTACT_EMAIL = "contact@apindexpharma.com"
const DEFAULT_PRODUCT_SUMMARY =
  "Further product information is available for institutional and export enquiries."

function decodeBasicEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
}

function stripHtmlTags(value: string | null): string {
  if (!value) {
    return ""
  }

  return decodeBasicEntities(
    value
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<\/div>/gi, "\n")
      .replace(/<\/li>/gi, "\n")
      .replace(/<li>/gi, "- ")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/\r/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim()
}

function isMeaningfulProductDescription(
  description: string,
  productName: string
): boolean {
  const normalizedDescription = description.trim().toLowerCase()
  const normalizedProductName = productName.trim().toLowerCase()
  const footerPlaceholders = new Set([
    "address",
    "get in touch",
    "additional links",
    "global certifications",
  ])

  return (
    Boolean(normalizedDescription) &&
    normalizedDescription !== normalizedProductName &&
    !footerPlaceholders.has(normalizedDescription)
  )
}

function buildEnquiryHref(subject: string, body: string): string {
  const searchParams = new URLSearchParams({
    subject,
    body,
  })

  return `mailto:${CONTACT_EMAIL}?${searchParams.toString()}`
}

export function buildProductHeadline(productName: string): {
  primary: string
  accent: string | null
} {
  const words = productName.trim().split(/\s+/).filter(Boolean)

  if (words.length < 3) {
    return {
      primary: productName,
      accent: null,
    }
  }

  const splitIndex = Math.ceil(words.length / 2)

  return {
    primary: words.slice(0, splitIndex).join(" "),
    accent: words.slice(splitIndex).join(" "),
  }
}

export function getProductHeroBadge(product: PublicProductDetail): string {
  const therapeuticUse = product.pharmaDetails?.therapeuticUse?.trim()
  if (therapeuticUse) {
    return `${therapeuticUse} Therapeutic`
  }

  const categoryName = product.categories[0]?.name?.trim()
  if (categoryName) {
    return `${categoryName} Therapeutic`
  }

  return "Pharmaceutical Product"
}

export function getProductSummary(product: PublicProductDetail): string {
  const shortDescription = product.short_description?.trim()
  if (shortDescription) {
    return shortDescription
  }

  const cleanedDescription = stripHtmlTags(product.description)
  if (cleanedDescription) {
    return cleanedDescription
  }

  return DEFAULT_PRODUCT_SUMMARY
}

export function getProductDescriptionParagraphs(
  product: PublicProductDetail
): string[] {
  const cleanedDescription = stripHtmlTags(product.description)
  if (!isMeaningfulProductDescription(cleanedDescription, product.name)) {
    return []
  }

  return cleanedDescription
    .split(/\n{2,}|\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
}

const ALLOWED_DESCRIPTION_TAGS: Set<string> = new Set([
  "p", "br",
  "strong", "b", "em", "i", "s", "del",
  "h1", "h2", "h3",
  "ul", "ol", "li",
  "blockquote", "pre", "code",
  "hr",
])

// Pure string-based sanitizer — no DOM or filesystem access needed.
// Strips all attributes (eliminates XSS via onclick, href, style, etc.)
// and removes any tags not in the allowlist.
function sanitizeDescriptionHtml(html: string): string {
  return html.replace(
    /<\/?\s*([a-zA-Z][a-zA-Z0-9]*)\s*(?:[^"'>]|"[^"]*"|'[^']*')*\s*\/?>/g,
    (match, tagName: string) => {
      const tag = tagName.toLowerCase()
      if (!ALLOWED_DESCRIPTION_TAGS.has(tag)) {
        return ""
      }
      return match.startsWith("</") ? `</${tag}>` : `<${tag}>`
    }
  )
}

export function getProductDescriptionHtml(
  product: PublicProductDetail
): string | null {
  const rawDescription = product.description?.trim()
  if (
    !rawDescription ||
    !isMeaningfulProductDescription(stripHtmlTags(rawDescription), product.name)
  ) {
    return null
  }
  return sanitizeDescriptionHtml(rawDescription)
}

export function buildProductDetailHref(handle: string): string {
  return `/products/${encodeURIComponent(handle)}`
}

export function buildProductDetailEnquiryHref(product: PublicProductDetail): string {
  return buildEnquiryHref(
    `${product.name} enquiry`,
    [
      "Hello Apindex team,",
      "",
      `I would like to enquire about ${product.name}.`,
      "Please share the available product details and export catalogue information.",
      "",
      "Thank you.",
    ].join("\n")
  )
}

export function buildProductBrochureHref(product: PublicProductDetail): string {
  const brochureUrl = product.pharmaDetails?.brochureUrl?.trim()
  if (brochureUrl) {
    return brochureUrl
  }

  return buildEnquiryHref(
    `${product.name} brochure request`,
    [
      "Hello Apindex team,",
      "",
      `Please share the brochure or dossier for ${product.name}.`,
      "",
      "Thank you.",
    ].join("\n")
  )
}

import type {
  CatalogCategory,
  PublicCatalogProduct,
} from "@/lib/data/public-catalog"
import type { IconType } from "react-icons"
import {
  HiOutlineBeaker,
  HiOutlineHeart,
  HiOutlineShieldCheck,
  HiOutlineSparkles,
  HiOutlineSquares2X2,
} from "react-icons/hi2"
import { GiMedicines } from "react-icons/gi"
import { LuDroplets, LuPill, LuSyringe, LuWind } from "react-icons/lu"
import { MdOutlineMedication, MdOutlineScience } from "react-icons/md"
import { TbTopologyStar3 } from "react-icons/tb"

export type PageToken = number | "ellipsis"

export const PRODUCTS_HERO_IMAGE_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBd5kPjfN-31epRntJwX3bI0bG7cbpTVMPQBqVIzrblHHNCN657ez8yLXCJdcBKKgO_XX-j9lNgMFTtG2d9bvSwdgNW_8WE2KCHRoaKXmnBBL1TyzQHi6L28yH44MnuNWyY6PMywRe0kWsEM1K84_ne99P48uZcL46jOd1Bd2DEwjZLnfq0ba6FLngIkBoNIzptH9WlS3O_5zUcIwJg1sHQbZxRoNdmPQEhoTeoYghqgBI5e8yqKuBucryau0OvXJaq0NwvWw_WJW4"

export const VALIDATED_EXCELLENCE_IMAGE_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAbO5BFTZN1hjOhGJtfoS0x13EgbEfgXOPVNoZZyY1zpCfpDuRCPHrqTgFwjLOrJrYVwVA1dWefxc0Ce_twA-btoUMc7aAXaJVMDjg5QcMYvcxN1e_JqcK-ys7LPgmUMUl-9d5w1zUQL23sPLl_k5T265O1djtRDRfvWdmj5ApcyLsde4GsdjF14tbT5ZCIYHElUDXwUT7XiVCZlKV9hV7Px9xYsfl2nLilniLAFK7PXx1anxeCB_Xl_TE3TYCAJIDY2fyYqOgJ2hw"

const CONTACT_EMAIL = "contact@apindexpharma.com"

function stripHtmlTags(value: string | null | undefined): string {
  if (!value) {
    return ""
  }

  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function truncateText(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value
  }

  return `${value.slice(0, maxLength).trim()}...`
}

function buildEnquiryHref(subject: string, body: string): string {
  const searchParams = new URLSearchParams({
    subject,
    body,
  })

  return `mailto:${CONTACT_EMAIL}?${searchParams.toString()}`
}

export function getProductSummary(product: PublicCatalogProduct): string {
  const shortDescription = product.short_description?.trim()
  if (shortDescription) {
    return truncateText(shortDescription, 110)
  }

  const cleanedDescription = stripHtmlTags(product.description)
  if (cleanedDescription) {
    return truncateText(cleanedDescription, 110)
  }

  return "Pharmaceutical formulation available for institutional and export enquiries."
}

export function getProductBadge(product: PublicCatalogProduct): string {
  return (
    product.collections[0]?.title?.trim() ||
    product.categories[0]?.name?.trim() ||
    "Product"
  )
}

export function getAllCategoriesIcon(): IconType {
  return HiOutlineSquares2X2
}

export function getCategoryIcon(category: CatalogCategory): IconType {
  const name = category.name.toLowerCase()

  if (name.includes("tablet")) {
    return LuPill
  }

  if (name.includes("capsule")) {
    return GiMedicines
  }

  if (name.includes("inject")) {
    return LuSyringe
  }

  if (name.includes("drop")) {
    return LuDroplets
  }

  if (name.includes("cream") || name.includes("ointment") || name.includes("gel")) {
    return HiOutlineSparkles
  }

  if (name.includes("syrup") || name.includes("suspension")) {
    return MdOutlineScience
  }

  if (name.includes("cardio") || name.includes("heart")) {
    return HiOutlineHeart
  }

  if (name.includes("onco") || name.includes("cancer")) {
    return TbTopologyStar3
  }

  if (name.includes("neuro")) {
    return HiOutlineBeaker
  }

  if (name.includes("gastro") || name.includes("digest")) {
    return MdOutlineMedication
  }

  if (name.includes("resp") || name.includes("pulmo") || name.includes("lung")) {
    return LuWind
  }

  if (name.includes("immun") || name.includes("anti-allergic")) {
    return HiOutlineShieldCheck
  }

  if (name.includes("anti") || name.includes("infect")) {
    return LuSyringe
  }

  if (name.includes("derma") || name.includes("skin")) {
    return HiOutlineSparkles
  }

  return MdOutlineMedication
}

export function getProductIcon(product: PublicCatalogProduct): IconType {
  const badge = getProductBadge(product).toLowerCase()
  const categoryNames = product.categories
    .map((category) => category.name)
    .join(" ")
    .toLowerCase()
  const iconSource = `${badge} ${categoryNames}`

  if (iconSource.includes("tablet")) {
    return LuPill
  }

  if (iconSource.includes("capsule")) {
    return GiMedicines
  }

  if (iconSource.includes("inject")) {
    return LuSyringe
  }

  if (iconSource.includes("drop")) {
    return LuDroplets
  }

  if (
    iconSource.includes("cream") ||
    iconSource.includes("ointment") ||
    iconSource.includes("gel")
  ) {
    return HiOutlineSparkles
  }

  if (iconSource.includes("syrup") || iconSource.includes("suspension")) {
    return MdOutlineScience
  }

  return GiMedicines
}

export function buildProductEnquiryHref(product: PublicCatalogProduct): string {
  return buildEnquiryHref(
    `${product.name} enquiry`,
    [
      "Hello Apindex team,",
      "",
      `I would like to enquire about ${product.name}.`,
      "Please share the available catalogue details.",
      "",
      "Thank you.",
    ].join("\n")
  )
}

export function buildCatalogRequestHref(): string {
  return buildEnquiryHref(
    "Apindex product catalog request",
    [
      "Hello Apindex team,",
      "",
      "Please share your latest pharmaceutical product catalog.",
      "",
      "Thank you.",
    ].join("\n")
  )
}

export function buildProductsPageHref(options: {
  query?: string
  categoryHandle?: string | null
  page?: number
}): string {
  const searchParams = new URLSearchParams()

  if (options.query?.trim()) {
    searchParams.set("q", options.query.trim())
  }

  if (options.categoryHandle) {
    searchParams.set("category", options.categoryHandle)
  }

  if (options.page && options.page > 1) {
    searchParams.set("page", options.page.toString())
  }

  const queryString = searchParams.toString()
  return queryString ? `/products?${queryString}` : "/products"
}

export function buildPageTokens(currentPage: number, totalPages: number): PageToken[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const tokens: PageToken[] = [1]
  const windowStart = Math.max(2, currentPage - 1)
  const windowEnd = Math.min(totalPages - 1, currentPage + 1)

  if (windowStart > 2) {
    tokens.push("ellipsis")
  }

  for (let page = windowStart; page <= windowEnd; page += 1) {
    tokens.push(page)
  }

  if (windowEnd < totalPages - 1) {
    tokens.push("ellipsis")
  }

  tokens.push(totalPages)

  return tokens
}

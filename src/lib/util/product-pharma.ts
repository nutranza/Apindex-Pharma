export type ProductPharmaDetails = {
  tradeName: string | null
  availableStrength: string | null
  availableCombination: string | null
  packing: string | null
  packInsertLeaflet: boolean | null
  therapeuticUse: string | null
  productionCapacity: string | null
  brochureUrl: string | null
}

export type ProductPharmaDetailsFormDefaults = {
  tradeName: string
  availableStrength: string
  availableCombination: string
  packing: string
  packInsertLeaflet: "" | "yes" | "no"
  therapeuticUse: string
  productionCapacity: string
  brochureUrl: string
}

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function toNullableTrimmedString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null
  }

  const trimmedValue = value.trim()
  return trimmedValue ? trimmedValue : null
}

function hasPharmaDetailsContent(details: ProductPharmaDetails): boolean {
  return Boolean(
    details.tradeName ||
      details.availableStrength ||
      details.availableCombination ||
      details.packing ||
      details.packInsertLeaflet !== null ||
      details.therapeuticUse ||
      details.productionCapacity ||
      details.brochureUrl
  )
}

function parsePackInsertLeaflet(value: unknown): boolean | null {
  if (typeof value === "boolean") {
    return value
  }

  if (typeof value !== "string") {
    return null
  }

  const normalizedValue = value.trim().toLowerCase()
  if (normalizedValue === "yes" || normalizedValue === "true") {
    return true
  }

  if (normalizedValue === "no" || normalizedValue === "false") {
    return false
  }

  return null
}

function getTrimmedFormValue(formData: FormData, key: string): string {
  const value = formData.get(key)

  if (typeof value !== "string") {
    return ""
  }

  return value.trim()
}

export function parseProductPharmaDetails(value: unknown): ProductPharmaDetails | null {
  if (!isRecord(value)) {
    return null
  }

  const details: ProductPharmaDetails = {
    tradeName: toNullableTrimmedString(value.trade_name),
    availableStrength: toNullableTrimmedString(value.available_strength),
    availableCombination: toNullableTrimmedString(value.available_combination),
    packing: toNullableTrimmedString(value.packing),
    packInsertLeaflet: parsePackInsertLeaflet(value.pack_insert_leaflet),
    therapeuticUse: toNullableTrimmedString(value.therapeutic_use),
    productionCapacity: toNullableTrimmedString(value.production_capacity),
    brochureUrl: toNullableTrimmedString(value.brochure_url),
  }

  return hasPharmaDetailsContent(details) ? details : null
}

export function getProductPharmaDetails(metadata: unknown): ProductPharmaDetails | null {
  if (!isRecord(metadata)) {
    return null
  }

  return parseProductPharmaDetails(metadata.pharma_details)
}

export function buildProductPharmaDetailsFormDefaults(
  details: ProductPharmaDetails | null
): ProductPharmaDetailsFormDefaults {
  return {
    tradeName: details?.tradeName ?? "",
    availableStrength: details?.availableStrength ?? "",
    availableCombination: details?.availableCombination ?? "",
    packing: details?.packing ?? "",
    packInsertLeaflet:
      details?.packInsertLeaflet === true
        ? "yes"
        : details?.packInsertLeaflet === false
          ? "no"
          : "",
    therapeuticUse: details?.therapeuticUse ?? "",
    productionCapacity: details?.productionCapacity ?? "",
    brochureUrl: details?.brochureUrl ?? "",
  }
}

export function buildProductPharmaDetailsFromFormData(
  formData: FormData
): ProductPharmaDetails | null {
  const tradeName = getTrimmedFormValue(formData, "pharma_trade_name")
  const availableStrength = getTrimmedFormValue(formData, "pharma_available_strength")
  const availableCombination = getTrimmedFormValue(formData, "pharma_available_combination")
  const packing = getTrimmedFormValue(formData, "pharma_packing")
  const packInsertLeafletValue = getTrimmedFormValue(formData, "pharma_pack_insert_leaflet")
  const therapeuticUse = getTrimmedFormValue(formData, "pharma_therapeutic_use")
  const productionCapacity = getTrimmedFormValue(formData, "pharma_production_capacity")
  const brochureUrl = getTrimmedFormValue(formData, "pharma_brochure_url")

  const details: ProductPharmaDetails = {
    tradeName: tradeName || null,
    availableStrength: availableStrength || null,
    availableCombination: availableCombination || null,
    packing: packing || null,
    packInsertLeaflet: parsePackInsertLeaflet(packInsertLeafletValue),
    therapeuticUse: therapeuticUse || null,
    productionCapacity: productionCapacity || null,
    brochureUrl: brochureUrl || null,
  }

  return hasPharmaDetailsContent(details) ? details : null
}

export function mergeProductPharmaDetailsMetadata(
  metadata: UnknownRecord,
  details: ProductPharmaDetails | null
): UnknownRecord {
  const nextMetadata: UnknownRecord = { ...metadata }

  if (details) {
    nextMetadata.pharma_details = {
      trade_name: details.tradeName,
      available_strength: details.availableStrength,
      available_combination: details.availableCombination,
      packing: details.packing,
      pack_insert_leaflet: details.packInsertLeaflet,
      therapeutic_use: details.therapeuticUse,
      production_capacity: details.productionCapacity,
      brochure_url: details.brochureUrl,
    }
  } else {
    delete nextMetadata.pharma_details
  }

  return nextMetadata
}

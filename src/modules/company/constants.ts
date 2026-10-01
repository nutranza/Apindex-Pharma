export type CompanyStat = {
  value: string
  label: string
}

export const GLOBAL_STATS: CompanyStat[] = [
  { value: "25+", label: "Countries Served" },
  { value: "1000+", label: "Global Clients" },
  { value: "400+", label: "Sterile Products" },
  { value: "500+", label: "Non-Sterile Products" },
]

export const COMPANY_TAGLINE =
  "Quality-focused pharmaceutical supply for healthcare partners worldwide."

export const COMPANY_DESCRIPTION =
  "Dependable pharmaceutical supply and manufacturing support for healthcare partners worldwide."

export const COMPANY_ADDRESS = {
  street:
    "401, Rudra Diamond, Near Zalal Liquid, Near Kiran Hospital, Katargam",
  city: "Surat",
  state: "Gujarat",
  postalCode: "395004",
  country: "India",
} as const

export const COMPANY_ADDRESS_TEXT = [
  COMPANY_ADDRESS.street,
  COMPANY_ADDRESS.city,
  COMPANY_ADDRESS.state,
  COMPANY_ADDRESS.postalCode,
  COMPANY_ADDRESS.country,
].join(", ")

export const INDUSTRY_OPTIONS = [
  "Auto, Tools & Hardware",
  "Build, Decore & Secure",
  "Electrical, Electronics & ICT",
  "Energy, Solar & Power",
  "Food, Kitchen & Agriculture",
  "Industrial Equipment & Machinery",
  "Medical, Health & Pharma",
  "Textile, Apparel & Fashion",
  "Other",
] as const

export const BUSINESS_TYPE_OPTIONS = [
  "Importer",
  "Dealer / Distributor",
  "Retailer",
  "Manufacturer",
  "Service Provider",
  "Start Up/ Entrepreneur",
  "Other",
] as const

export const LOOKING_FOR_OPTIONS = [
  "Find new Indian suppliers or partners",
  "Explore dealership or franchise opportunities",
  "B2B meetings",
  "Learn about new technologies",
  "Networking & Market Insight",
] as const

export const REFERRAL_SOURCE_OPTIONS = [
  "Social Media",
  "WhatsApp Message",
  "Newspaper Ad",
  "Radio Jingle",
  "Email from Organizer",
  "Invite from Exhibitor",
  "Invite from Local Chambers / Association",
  "Other",
] as const

export type IndustryOption = (typeof INDUSTRY_OPTIONS)[number]
export type BusinessTypeOption = (typeof BUSINESS_TYPE_OPTIONS)[number]
export type LookingForOption = (typeof LOOKING_FOR_OPTIONS)[number]
export type ReferralSourceOption = (typeof REFERRAL_SOURCE_OPTIONS)[number]

export type VisitorRegistrationPayload = {
  firstName: string
  lastName: string
  companyName: string
  designation: string
  whatsappNumber: string
  email: string
  website: string
  countyCountry: string
  industries: IndustryOption[]
  industryOther: string
  businessTypes: BusinessTypeOption[]
  businessTypeOther: string
  lookingFor: LookingForOption
  partnershipInterest: string
  referralSource: ReferralSourceOption
  referralSourceOther: string
  privacyConsent: boolean
}

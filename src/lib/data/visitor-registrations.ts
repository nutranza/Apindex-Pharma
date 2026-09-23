import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import type { VisitorRegistration } from "@/lib/supabase/types"
import { ensureAdmin } from "@/lib/data/admin"
import type { VisitorRegistrationPayload } from "@/modules/visitor-registration/constants"

const LIST_COLUMNS =
  "id, created_at, first_name, last_name, company_name, email, whatsapp_number, county_country"

const DETAIL_COLUMNS =
  "id, created_at, first_name, last_name, company_name, designation, whatsapp_number, email, website, county_country, industries, industry_other, business_types, business_type_other, looking_for, partnership_interest, referral_source, referral_source_other, privacy_consent"

export type VisitorRegistrationListItem = Pick<
  VisitorRegistration,
  | "id"
  | "created_at"
  | "first_name"
  | "last_name"
  | "company_name"
  | "email"
  | "whatsapp_number"
  | "county_country"
>

export async function createVisitorRegistration(
  payload: VisitorRegistrationPayload
): Promise<string> {
  const supabase = await createAdminClient()

  const { data, error } = await supabase
    .from("visitor_registrations")
    .insert({
      first_name: payload.firstName,
      last_name: payload.lastName,
      company_name: payload.companyName,
      designation: payload.designation,
      whatsapp_number: payload.whatsappNumber,
      email: payload.email,
      website: payload.website,
      county_country: payload.countyCountry,
      industries: payload.industries,
      industry_other: payload.industryOther,
      business_types: payload.businessTypes,
      business_type_other: payload.businessTypeOther,
      looking_for: payload.lookingFor,
      partnership_interest: payload.partnershipInterest,
      referral_source: payload.referralSource,
      referral_source_other: payload.referralSourceOther,
      privacy_consent: payload.privacyConsent,
    })
    .select("id")
    .single<{ id: string }>()

  if (error) {
    throw error
  }

  return data.id
}

export async function getVisitorRegistrations(): Promise<
  VisitorRegistrationListItem[]
> {
  await ensureAdmin()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("visitor_registrations")
    .select(LIST_COLUMNS)
    .order("created_at", { ascending: false })
    .overrideTypes<VisitorRegistrationListItem[]>()

  if (error) {
    throw error
  }

  return data ?? []
}

export async function getVisitorRegistration(
  id: string
): Promise<VisitorRegistration | null> {
  await ensureAdmin()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("visitor_registrations")
    .select(DETAIL_COLUMNS)
    .eq("id", id)
    .maybeSingle<VisitorRegistration>()

  if (error) {
    throw error
  }

  return data
}

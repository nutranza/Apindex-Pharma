export type PhoneCountryRule = {
  value: string
  label: string
  minDigits: number
  maxDigits: number
}

export const PHONE_COUNTRY_CODES = [
  { value: "+91", label: "+91 India", minDigits: 10, maxDigits: 10 },
  { value: "+254", label: "+254 Kenya", minDigits: 9, maxDigits: 9 },
  { value: "+255", label: "+255 Tanzania", minDigits: 9, maxDigits: 9 },
  { value: "+256", label: "+256 Uganda", minDigits: 9, maxDigits: 9 },
  { value: "+234", label: "+234 Nigeria", minDigits: 10, maxDigits: 10 },
  { value: "+27", label: "+27 South Africa", minDigits: 9, maxDigits: 9 },
  { value: "+971", label: "+971 United Arab Emirates", minDigits: 9, maxDigits: 9 },
  { value: "+966", label: "+966 Saudi Arabia", minDigits: 9, maxDigits: 9 },
  { value: "+20", label: "+20 Egypt", minDigits: 10, maxDigits: 10 },
  { value: "+251", label: "+251 Ethiopia", minDigits: 9, maxDigits: 9 },
  { value: "+233", label: "+233 Ghana", minDigits: 9, maxDigits: 9 },
  { value: "+44", label: "+44 United Kingdom", minDigits: 10, maxDigits: 10 },
  { value: "+1", label: "+1 United States / Canada", minDigits: 10, maxDigits: 10 },
  { value: "+61", label: "+61 Australia", minDigits: 9, maxDigits: 9 },
  { value: "+49", label: "+49 Germany", minDigits: 7, maxDigits: 11 },
  { value: "+33", label: "+33 France", minDigits: 9, maxDigits: 9 },
  { value: "+39", label: "+39 Italy", minDigits: 9, maxDigits: 11 },
  { value: "+34", label: "+34 Spain", minDigits: 9, maxDigits: 9 },
  { value: "+31", label: "+31 Netherlands", minDigits: 9, maxDigits: 9 },
  { value: "+880", label: "+880 Bangladesh", minDigits: 10, maxDigits: 10 },
  { value: "+92", label: "+92 Pakistan", minDigits: 10, maxDigits: 10 },
  { value: "+977", label: "+977 Nepal", minDigits: 10, maxDigits: 10 },
  { value: "+94", label: "+94 Sri Lanka", minDigits: 9, maxDigits: 9 },
  { value: "+65", label: "+65 Singapore", minDigits: 8, maxDigits: 8 },
  { value: "+60", label: "+60 Malaysia", minDigits: 9, maxDigits: 10 },
  { value: "+62", label: "+62 Indonesia", minDigits: 9, maxDigits: 12 },
  { value: "+63", label: "+63 Philippines", minDigits: 10, maxDigits: 10 },
  { value: "+86", label: "+86 China", minDigits: 11, maxDigits: 11 },
  { value: "+81", label: "+81 Japan", minDigits: 9, maxDigits: 10 },
] as const satisfies readonly PhoneCountryRule[]

export function getPhoneCountryRule(
  countryCode: string | null | undefined
): PhoneCountryRule | null {
  const normalizedCountryCode = countryCode?.trim()

  return (
    PHONE_COUNTRY_CODES.find(
      (country) => country.value === normalizedCountryCode
    ) ?? null
  )
}

export function getPhoneCountryName(
  countryCode: string | null | undefined
): string {
  const rule = getPhoneCountryRule(countryCode)

  return rule ? rule.label.slice(rule.value.length).trim() : "Not provided"
}

export function getPhoneNumberPattern(rule: PhoneCountryRule): string {
  return rule.minDigits === rule.maxDigits
    ? `\\d{${rule.maxDigits}}`
    : `\\d{${rule.minDigits},${rule.maxDigits}}`
}

export function validatePhoneNumber(
  countryCode: string | null | undefined,
  phoneNumber: string | null | undefined
): string | null {
  const value = phoneNumber?.trim() ?? ""

  if (!value) {
    return null
  }

  const rule = getPhoneCountryRule(countryCode)

  if (!rule) {
    return "Select a valid phone country code."
  }

  if (!/^\d+$/.test(value)) {
    return "Enter digits only in the phone number field."
  }

  if (value.length < rule.minDigits || value.length > rule.maxDigits) {
    const expectedLength =
      rule.minDigits === rule.maxDigits
        ? `${rule.maxDigits} digits`
        : `${rule.minDigits} to ${rule.maxDigits} digits`

    return `Enter ${expectedLength} for ${rule.label}.`
  }

  return null
}

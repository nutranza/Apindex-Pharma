export type PhoneCountryRule = {
  value: string
  label: string
  countryCodes: readonly string[]
  minDigits: number
  maxDigits: number
}

export const PHONE_COUNTRY_CODES = [
  {
    value: "+91",
    label: "+91 India",
    countryCodes: ["IN"],
    minDigits: 10,
    maxDigits: 10,
  },
  {
    value: "+254",
    label: "+254 Kenya",
    countryCodes: ["KE"],
    minDigits: 9,
    maxDigits: 9,
  },
  {
    value: "+255",
    label: "+255 Tanzania",
    countryCodes: ["TZ"],
    minDigits: 9,
    maxDigits: 9,
  },
  {
    value: "+256",
    label: "+256 Uganda",
    countryCodes: ["UG"],
    minDigits: 9,
    maxDigits: 9,
  },
  {
    value: "+234",
    label: "+234 Nigeria",
    countryCodes: ["NG"],
    minDigits: 10,
    maxDigits: 10,
  },
  {
    value: "+27",
    label: "+27 South Africa",
    countryCodes: ["ZA"],
    minDigits: 9,
    maxDigits: 9,
  },
  {
    value: "+971",
    label: "+971 United Arab Emirates",
    countryCodes: ["AE"],
    minDigits: 9,
    maxDigits: 9,
  },
  {
    value: "+966",
    label: "+966 Saudi Arabia",
    countryCodes: ["SA"],
    minDigits: 9,
    maxDigits: 9,
  },
  {
    value: "+20",
    label: "+20 Egypt",
    countryCodes: ["EG"],
    minDigits: 10,
    maxDigits: 10,
  },
  {
    value: "+251",
    label: "+251 Ethiopia",
    countryCodes: ["ET"],
    minDigits: 9,
    maxDigits: 9,
  },
  {
    value: "+233",
    label: "+233 Ghana",
    countryCodes: ["GH"],
    minDigits: 9,
    maxDigits: 9,
  },
  {
    value: "+44",
    label: "+44 United Kingdom",
    countryCodes: ["GB"],
    minDigits: 10,
    maxDigits: 10,
  },
  {
    value: "+1",
    label: "+1 United States / Canada",
    countryCodes: ["US", "CA"],
    minDigits: 10,
    maxDigits: 10,
  },
  {
    value: "+61",
    label: "+61 Australia",
    countryCodes: ["AU"],
    minDigits: 9,
    maxDigits: 9,
  },
  {
    value: "+49",
    label: "+49 Germany",
    countryCodes: ["DE"],
    minDigits: 7,
    maxDigits: 11,
  },
  {
    value: "+33",
    label: "+33 France",
    countryCodes: ["FR"],
    minDigits: 9,
    maxDigits: 9,
  },
  {
    value: "+39",
    label: "+39 Italy",
    countryCodes: ["IT"],
    minDigits: 9,
    maxDigits: 11,
  },
  {
    value: "+34",
    label: "+34 Spain",
    countryCodes: ["ES"],
    minDigits: 9,
    maxDigits: 9,
  },
  {
    value: "+31",
    label: "+31 Netherlands",
    countryCodes: ["NL"],
    minDigits: 9,
    maxDigits: 9,
  },
  {
    value: "+880",
    label: "+880 Bangladesh",
    countryCodes: ["BD"],
    minDigits: 10,
    maxDigits: 10,
  },
  {
    value: "+92",
    label: "+92 Pakistan",
    countryCodes: ["PK"],
    minDigits: 10,
    maxDigits: 10,
  },
  {
    value: "+977",
    label: "+977 Nepal",
    countryCodes: ["NP"],
    minDigits: 10,
    maxDigits: 10,
  },
  {
    value: "+94",
    label: "+94 Sri Lanka",
    countryCodes: ["LK"],
    minDigits: 9,
    maxDigits: 9,
  },
  {
    value: "+65",
    label: "+65 Singapore",
    countryCodes: ["SG"],
    minDigits: 8,
    maxDigits: 8,
  },
  {
    value: "+60",
    label: "+60 Malaysia",
    countryCodes: ["MY"],
    minDigits: 9,
    maxDigits: 10,
  },
  {
    value: "+62",
    label: "+62 Indonesia",
    countryCodes: ["ID"],
    minDigits: 9,
    maxDigits: 12,
  },
  {
    value: "+63",
    label: "+63 Philippines",
    countryCodes: ["PH"],
    minDigits: 10,
    maxDigits: 10,
  },
  {
    value: "+86",
    label: "+86 China",
    countryCodes: ["CN"],
    minDigits: 11,
    maxDigits: 11,
  },
  {
    value: "+81",
    label: "+81 Japan",
    countryCodes: ["JP"],
    minDigits: 9,
    maxDigits: 10,
  },
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

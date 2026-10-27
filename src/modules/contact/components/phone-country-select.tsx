"use client"

import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react"
import { Check, ChevronDown } from "lucide-react"
import ReactCountryFlag from "react-country-flag"

import {
  getPhoneCountryRule,
  PHONE_COUNTRY_CODES,
} from "@modules/contact/lib/phone-validation"

type PhoneCountrySelectProps = {
  value: string
  onChange: (_value: string) => void
  className: string
  disabled?: boolean
}

export default function PhoneCountrySelect({
  value,
  onChange,
  className,
  disabled,
}: PhoneCountrySelectProps) {
  const country = getPhoneCountryRule(value) ?? PHONE_COUNTRY_CODES[0]

  return (
    <Listbox
      value={value}
      onChange={onChange}
      name="phone_country_code"
      disabled={disabled}
    >
      <ListboxButton
        aria-label={`Phone Country Code: ${country.label}`}
        title={country.label}
        className={`${className} flex items-center justify-between gap-2 disabled:cursor-not-allowed disabled:opacity-60`}
      >
        <span className="flex min-w-0 items-center gap-2">
          <CountryFlags codes={country.countryCodes} />
          <span>{country.value}</span>
        </span>
        <ChevronDown
          aria-hidden="true"
          className="size-4 shrink-0 text-on-surface-variant"
        />
      </ListboxButton>
      <ListboxOptions
        anchor={{ to: "bottom start", gap: 6, padding: 12 }}
        className="z-[100] max-h-64 w-80 max-w-[calc(100vw-1.5rem)] overflow-y-auto rounded-xl border border-outline-variant/30 bg-white p-1.5 shadow-lg focus:outline-none"
      >
        {PHONE_COUNTRY_CODES.map((option) => (
          <ListboxOption
            key={option.value}
            value={option.value}
            className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-3 text-sm text-on-surface data-[focus]:bg-primary-fixed"
          >
            {({ selected }) => (
              <>
                <CountryFlags codes={option.countryCodes} />
                <span className="min-w-0 flex-1">
                  {option.label.slice(option.value.length).trim()}
                </span>
                <span className="shrink-0 text-on-surface-variant">
                  {option.value}
                </span>
                <span className="w-4 shrink-0">
                  {selected ? (
                    <Check
                      aria-hidden="true"
                      className="size-4 text-on-secondary-container"
                    />
                  ) : null}
                </span>
              </>
            )}
          </ListboxOption>
        ))}
      </ListboxOptions>
    </Listbox>
  )
}

function CountryFlags({ codes }: { codes: readonly string[] }) {
  return (
    <span aria-hidden="true" className="inline-flex shrink-0 -space-x-1">
      {codes.map((code) => (
        <ReactCountryFlag
          key={code}
          countryCode={code}
          svg
          cdnUrl="/assets/flags/"
          alt=""
          className="rounded-sm ring-1 ring-white"
          style={{ width: "1.125rem", height: "0.875rem", objectFit: "cover" }}
        />
      ))}
    </span>
  )
}

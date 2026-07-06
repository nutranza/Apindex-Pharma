"use client"

import { ChevronDown, Send } from "lucide-react"
import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react"

import { useOptionalToast } from "@modules/common/context/toast-context"

const ISO_COUNTRY_CODES = [
  "AF", "AX", "AL", "DZ", "AS", "AD", "AO", "AI", "AQ", "AG", "AR", "AM",
  "AW", "AU", "AT", "AZ", "BS", "BH", "BD", "BB", "BY", "BE", "BZ", "BJ",
  "BM", "BT", "BO", "BQ", "BA", "BW", "BV", "BR", "IO", "BN", "BG", "BF",
  "BI", "CV", "KH", "CM", "CA", "KY", "CF", "TD", "CL", "CN", "CX", "CC",
  "CO", "KM", "CG", "CD", "CK", "CR", "CI", "HR", "CU", "CW", "CY", "CZ",
  "DK", "DJ", "DM", "DO", "EC", "EG", "SV", "GQ", "ER", "EE", "SZ", "ET",
  "FK", "FO", "FJ", "FI", "FR", "GF", "PF", "TF", "GA", "GM", "GE", "DE",
  "GH", "GI", "GR", "GL", "GD", "GP", "GU", "GT", "GG", "GN", "GW", "GY",
  "HT", "HM", "VA", "HN", "HK", "HU", "IS", "IN", "ID", "IR", "IQ", "IE",
  "IM", "IL", "IT", "JM", "JP", "JE", "JO", "KZ", "KE", "KI", "KP", "KR",
  "KW", "KG", "LA", "LV", "LB", "LS", "LR", "LY", "LI", "LT", "LU", "MO",
  "MG", "MW", "MY", "MV", "ML", "MT", "MH", "MQ", "MR", "MU", "YT", "MX",
  "FM", "MD", "MC", "MN", "ME", "MS", "MA", "MZ", "MM", "NA", "NR", "NP",
  "NL", "NC", "NZ", "NI", "NE", "NG", "NU", "NF", "MK", "MP", "NO", "OM",
  "PK", "PW", "PS", "PA", "PG", "PY", "PE", "PH", "PN", "PL", "PT", "PR",
  "QA", "RE", "RO", "RU", "RW", "BL", "SH", "KN", "LC", "MF", "PM", "VC",
  "WS", "SM", "ST", "SA", "SN", "RS", "SC", "SL", "SG", "SX", "SK", "SI",
  "SB", "SO", "ZA", "GS", "SS", "ES", "LK", "SD", "SR", "SJ", "SE", "CH",
  "SY", "TW", "TJ", "TZ", "TH", "TL", "TG", "TK", "TO", "TT", "TN", "TR",
  "TM", "TC", "TV", "UG", "UA", "AE", "GB", "US", "UM", "UY", "UZ", "VU",
  "VE", "VN", "VG", "VI", "WF", "EH", "YE", "ZM", "ZW",
] as const

const FIELD_CLASS =
  "w-full rounded-xl border border-outline-variant/25 bg-white px-4 py-3.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-2 focus:ring-primary/15"

type ContactApiResponse = {
  success?: boolean
  message?: string
}

function buildCountryOptions(): string[] {
  const displayNames = new Intl.DisplayNames(["en"], { type: "region" })
  const countryNames = ISO_COUNTRY_CODES.map((code) => displayNames.of(code))
    .filter((country): country is string => Boolean(country))
    .sort((a, b) => a.localeCompare(b))

  return [...countryNames, "Other"]
}

const COUNTRIES = buildCountryOptions()

export default function ContactInquiryForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const toast = useOptionalToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)

  useEffect(() => {
    if (status?.type !== "success") {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setStatus(null)
    }, 5000)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [status])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const payload = Object.fromEntries(formData.entries())

    setStatus(null)
    setIsSubmitting(true)

    void submitInquiry(payload)
  }

  const submitInquiry = async (payload: Record<string, FormDataEntryValue>) => {
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const result = (await response
        .json()
        .catch(() => ({}))) as ContactApiResponse

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "We could not send your inquiry right now. Please try again."
        )
      }

      const message =
        result.message || "Your inquiry has been sent successfully."

      formRef.current?.reset()
      setStatus({ type: "success", message })
      toast?.showToast(message, "success", "Inquiry Sent")
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "We could not send your inquiry right now. Please try again."

      setStatus({ type: "error", message })
      toast?.showToast(message, "error", "Send Failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
      <input
        type="text"
        name="company_website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Field label="Full Name">
          <input
            aria-label="Full Name"
            name="full_name"
            type="text"
            placeholder="Your name"
            className={FIELD_CLASS}
            required
            minLength={2}
            maxLength={120}
          />
        </Field>
        <Field label="Work Email">
          <input
            aria-label="Work Email"
            name="work_email"
            type="email"
            placeholder="name@company.com"
            className={FIELD_CLASS}
            required
            maxLength={160}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Field label="Phone Number">
          <input
            aria-label="Phone Number"
            name="phone_number"
            type="tel"
            placeholder="+91 00000 00000"
            className={FIELD_CLASS}
            maxLength={40}
          />
        </Field>
        <Field label="Country">
          <div className="relative">
            <select
              aria-label="Country"
              name="country"
              defaultValue="India"
              className={`${FIELD_CLASS} appearance-none pr-12`}
              required
            >
              {COUNTRIES.map((country) => (
                <option key={country}>{country}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant" />
          </div>
        </Field>
      </div>

      <Field label="Message">
        <textarea
          aria-label="Message"
          name="message"
          rows={5}
          placeholder="Tell us about your product, partnership, or export requirement..."
          className={`${FIELD_CLASS} resize-none`}
          required
          minLength={10}
          maxLength={4000}
        />
      </Field>

      {status ? (
        <p
          className={`rounded-xl px-4 py-3 text-sm font-medium ${
            status.type === "success"
              ? "bg-primary/10 text-primary"
              : "bg-red-50 text-red-700"
          }`}
          role={status.type === "error" ? "alert" : "status"}
          aria-live="polite"
        >
          {status.message}
        </p>
      ) : null}

      <div className="pt-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-primary px-8 py-4 apx-font-headline text-base font-semibold text-white transition-colors hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-70 md:w-auto"
        >
          {isSubmitting ? "Sending..." : "Submit Message"}
          <Send className="h-5 w-5" strokeWidth={2.4} />
        </button>
      </div>
    </form>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <label className="block space-y-2">
      <span className="block text-sm font-semibold text-on-surface">
        {label}
      </span>
      {children}
    </label>
  )
}

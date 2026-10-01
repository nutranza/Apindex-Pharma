"use client"

import Link from "next/link"
import { ChevronDown, Send } from "lucide-react"
import {
  type FormEvent,
  type ReactNode,
  useRef,
  useState,
} from "react"

import Modal from "@modules/common/components/modal"
import { useOptionalToast } from "@modules/common/context/toast-context"
import {
  getPhoneCountryRule,
  getPhoneNumberPattern,
  PHONE_COUNTRY_CODES,
  validatePhoneNumber,
} from "@modules/contact/lib/phone-validation"

const FIELD_CLASS =
  "w-full rounded-xl border border-outline-variant/25 bg-white px-4 py-3.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-2 focus:ring-primary/15"

type ContactApiResponse = {
  success?: boolean
  message?: string
}

export default function ContactInquiryForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const toast = useOptionalToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<{
    type: "error"
    message: string
  } | null>(null)
  const [isThankYouOpen, setIsThankYouOpen] = useState(false)
  const [phoneCountryCode, setPhoneCountryCode] = useState<string>(
    PHONE_COUNTRY_CODES[0].value
  )
  const [phoneNumber, setPhoneNumber] = useState("")
  const phoneRule =
    getPhoneCountryRule(phoneCountryCode) ?? PHONE_COUNTRY_CODES[0]

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const payload = Object.fromEntries(formData.entries())
    const phoneValidationError = validatePhoneNumber(
      phoneCountryCode,
      phoneNumber
    )

    if (phoneValidationError) {
      setStatus({ type: "error", message: phoneValidationError })
      return
    }

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
      setPhoneCountryCode(PHONE_COUNTRY_CODES[0].value)
      setPhoneNumber("")
      setStatus(null)
      setIsThankYouOpen(true)
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

      <div className="grid grid-cols-1 gap-5">
        <Field label="Phone Number">
          <div className="grid grid-cols-[minmax(0,150px)_minmax(0,1fr)] gap-2">
            <div className="relative">
              <select
                aria-label="Phone Country Code"
                name="phone_country_code"
                value={phoneCountryCode}
                autoComplete="tel-country-code"
                className={`${FIELD_CLASS} appearance-none pr-10`}
                onChange={(event) => {
                  const nextCountryCode = event.target.value
                  const nextRule =
                    getPhoneCountryRule(nextCountryCode) ?? PHONE_COUNTRY_CODES[0]

                  setPhoneCountryCode(nextCountryCode)
                  setPhoneNumber((currentValue) =>
                    currentValue.slice(0, nextRule.maxDigits)
                  )
                }}
              >
                {PHONE_COUNTRY_CODES.map((countryCode) => (
                  <option key={countryCode.value} value={countryCode.value}>
                    {countryCode.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant" />
            </div>
            <input
              aria-label="Phone Number"
              name="phone_number"
              type="tel"
              placeholder="00000 00000"
              autoComplete="tel-national"
              className={FIELD_CLASS}
              inputMode="numeric"
              pattern={getPhoneNumberPattern(phoneRule)}
              maxLength={phoneRule.maxDigits}
              minLength={phoneRule.minDigits}
              title={`Enter ${
                phoneRule.minDigits === phoneRule.maxDigits
                  ? phoneRule.maxDigits
                  : `${phoneRule.minDigits} to ${phoneRule.maxDigits}`
              } digits for ${phoneRule.label}`}
              value={phoneNumber}
              onChange={(event) => {
                const digitsOnly = event.target.value
                  .replace(/\D/g, "")
                  .slice(0, phoneRule.maxDigits)

                setPhoneNumber(digitsOnly)
              }}
            />
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
          className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          role="alert"
          aria-live="polite"
        >
          {status.message}
        </p>
      ) : null}

      <label className="flex max-w-xl cursor-pointer items-start gap-3 text-on-surface-variant">
        <input
          type="checkbox"
          name="contact_consent"
          value="yes"
          required
          aria-label="Privacy consent"
          className="mt-1 size-5 shrink-0 rounded-md border-outline-variant accent-primary"
        />
        <span className="text-sm">
          <span>
            I am okay to be contacted by Apindex Pharma regarding my inquiry
            over Call, WhatsApp, or Email.
          </span>{" "}
          <span>
            I have read the{" "}
            <Link
              href="/privacy-policy"
              className="font-semibold text-primary transition-colors hover:text-primary-container"
            >
              Privacy Policy
            </Link>
            .
          </span>
        </span>
      </label>

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-primary px-8 py-4 apx-font-headline text-base font-semibold text-white transition-colors hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-70 md:w-auto"
        >
          {isSubmitting ? "Sending..." : "Submit Message"}
          <Send className="h-5 w-5" strokeWidth={2.4} />
        </button>
      </div>

      <Modal
        isOpen={isThankYouOpen}
        close={() => setIsThankYouOpen(false)}
        size="small"
      >
        <Modal.Title>Thank you</Modal.Title>
        <Modal.Description>
          Thank you for contacting Apindex Pharma. Our team will reach out to
          you within 24–48 hours.
        </Modal.Description>
        <Modal.Footer>
          <button
            type="button"
            onClick={() => setIsThankYouOpen(false)}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            Close
          </button>
        </Modal.Footer>
      </Modal>
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

"use client"

import Link from "next/link"
import { type FormEvent, useRef, useState } from "react"

import {
  BUSINESS_TYPE_OPTIONS,
  INDUSTRY_OPTIONS,
  LOOKING_FOR_OPTIONS,
  REFERRAL_SOURCE_OPTIONS,
  type BusinessTypeOption,
  type IndustryOption,
  type ReferralSourceOption,
} from "@modules/visitor-registration/constants"

const FIELD_CLASS =
  "w-full rounded-xl border border-outline-variant/30 bg-white px-4 py-3 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-2 focus:ring-primary/15"

const CHECKBOX_CLASS =
  "size-5 shrink-0 rounded border-outline-variant accent-primary"

type FormStatus = {
  type: "success" | "error"
  message: string
}

type GroupErrorKey =
  | "industries"
  | "industryOther"
  | "businessTypes"
  | "businessTypeOther"
  | "referralSourceOther"

type GroupErrors = Partial<Record<GroupErrorKey, string>>

type VisitorRegistrationRequest = {
  firstName: string
  lastName: string
  companyName: string
  designation: string
  whatsappNumber: string
  email: string
  website: string
  countyCountry: string
  industries: string[]
  industryOther: string
  businessTypes: string[]
  businessTypeOther: string
  lookingFor: string
  partnershipInterest: string
  referralSource: string
  referralSourceOther: string
  privacyConsent: boolean
}

type VisitorRegistrationResponse = {
  success?: boolean
  message?: string
}

export default function VisitorRegistrationForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<FormStatus | null>(null)
  const [groupErrors, setGroupErrors] = useState<GroupErrors>({})
  const [selectedIndustries, setSelectedIndustries] = useState<
    IndustryOption[]
  >([])
  const [selectedBusinessTypes, setSelectedBusinessTypes] = useState<
    BusinessTypeOption[]
  >([])
  const [selectedReferralSource, setSelectedReferralSource] =
    useState<ReferralSourceOption | "">("")

  const updateGroupError = (key: GroupErrorKey, message?: string) => {
    setGroupErrors((currentErrors) => {
      const nextErrors = { ...currentErrors }

      if (message) {
        nextErrors[key] = message
      } else {
        delete nextErrors[key]
      }

      return nextErrors
    })
  }

  const handleOptionChange = (
    group: "industries" | "businessTypes",
    value: IndustryOption | BusinessTypeOption,
    checked: boolean
  ) => {
    if (group === "industries") {
      setSelectedIndustries((currentOptions) => {
        if (checked) {
          return [...currentOptions, value as IndustryOption]
        }

        return currentOptions.filter((option) => option !== value)
      })

      updateGroupError("industries")
      updateGroupError("industryOther")
      return
    }

    setSelectedBusinessTypes((currentOptions) => {
      if (checked) {
        return [...currentOptions, value as BusinessTypeOption]
      }

      return currentOptions.filter((option) => option !== value)
    })

    updateGroupError("businessTypes")
    updateGroupError("businessTypeOther")
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const payload: VisitorRegistrationRequest = {
      firstName: String(formData.get("firstName") || ""),
      lastName: String(formData.get("lastName") || ""),
      companyName: String(formData.get("companyName") || ""),
      designation: String(formData.get("designation") || ""),
      whatsappNumber: String(formData.get("whatsappNumber") || ""),
      email: String(formData.get("email") || ""),
      website: String(formData.get("website") || ""),
      countyCountry: String(formData.get("countyCountry") || ""),
      industries: formData.getAll("industries").map(String),
      industryOther: String(formData.get("industryOther") || ""),
      businessTypes: formData.getAll("businessTypes").map(String),
      businessTypeOther: String(formData.get("businessTypeOther") || ""),
      lookingFor: String(formData.get("lookingFor") || ""),
      partnershipInterest: String(formData.get("partnershipInterest") || ""),
      referralSource: String(formData.get("referralSource") || ""),
      referralSourceOther: String(formData.get("referralSourceOther") || ""),
      privacyConsent: formData.get("privacyConsent") === "on",
    }

    const nextErrors: GroupErrors = {}

    if (payload.industries.length === 0) {
      nextErrors.industries = "Select at least one industry."
    }

    if (payload.industries.includes("Other") && !payload.industryOther.trim()) {
      nextErrors.industryOther = "Enter your industry."
    }

    if (payload.businessTypes.length === 0) {
      nextErrors.businessTypes = "Select at least one business type."
    }

    if (
      payload.businessTypes.includes("Other") &&
      !payload.businessTypeOther.trim()
    ) {
      nextErrors.businessTypeOther = "Enter your business type."
    }

    if (
      payload.referralSource === "Other" &&
      !payload.referralSourceOther.trim()
    ) {
      nextErrors.referralSourceOther = "Enter how you found the Expo."
    }

    setGroupErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      setStatus({
        type: "error",
        message: "Please complete the highlighted selections.",
      })
      return
    }

    setStatus(null)
    setIsSubmitting(true)
    void submitRegistration(payload)
  }

  const submitRegistration = async (payload: VisitorRegistrationRequest) => {
    try {
      const response = await fetch("/api/visitor-registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const result = (await response.json().catch(() => ({}))) as VisitorRegistrationResponse

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "We could not submit your registration right now. Please try again."
        )
      }

      formRef.current?.reset()
      setSelectedIndustries([])
      setSelectedBusinessTypes([])
      setSelectedReferralSource("")
      setGroupErrors({})
      setStatus({
        type: "success",
        message: result.message || "Visitor registration submitted successfully.",
      })
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "We could not submit your registration right now. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-7">
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-on-surface">
          Name <span className="text-primary">*</span>
        </legend>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <TextField
            id="firstName"
            name="firstName"
            label="First Name"
            required
          />
          <TextField
            id="lastName"
            name="lastName"
            label="Last Name"
            required
          />
        </div>
      </fieldset>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <TextField
          id="companyName"
          name="companyName"
          label="Company / Business Name"
          required
        />
        <TextField
          id="designation"
          name="designation"
          label="Designation in Company / Business"
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <TextField
          id="whatsappNumber"
          name="whatsappNumber"
          label="WhatsApp Number with Country Code"
          placeholder="254 xxx xxxxxx"
          inputMode="numeric"
          pattern="[0-9]{10,13}"
          maxLength={13}
          required
        />
        <TextField
          id="email"
          name="email"
          label="Email"
          type="email"
          placeholder="example@example.com"
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <TextField id="website" name="website" label="Website" required />
        <TextField
          id="countyCountry"
          name="countyCountry"
          label="County and Country"
          placeholder="Nairobi, Kenya"
          required
        />
      </div>

      <CheckboxGroup
        error={groupErrors.industries}
        legend="Industry You Belong To:"
        name="industries"
        options={INDUSTRY_OPTIONS}
        selectedOptions={selectedIndustries}
        onChange={handleOptionChange}
      />

      {selectedIndustries.includes("Other") ? (
        <OtherField
          id="industryOther"
          label="Other industry"
          name="industryOther"
          error={groupErrors.industryOther}
          onChange={() => updateGroupError("industryOther")}
        />
      ) : null}

      <CheckboxGroup
        error={groupErrors.businessTypes}
        legend="Your Business Type:"
        name="businessTypes"
        options={BUSINESS_TYPE_OPTIONS}
        selectedOptions={selectedBusinessTypes}
        onChange={handleOptionChange}
      />

      {selectedBusinessTypes.includes("Other") ? (
        <OtherField
          id="businessTypeOther"
          label="Other business type"
          name="businessTypeOther"
          error={groupErrors.businessTypeOther}
          onChange={() => updateGroupError("businessTypeOther")}
        />
      ) : null}

      <RadioGroup
        legend="What Are You Looking For at the Expo?"
        name="lookingFor"
        options={LOOKING_FOR_OPTIONS}
        defaultValue={LOOKING_FOR_OPTIONS[0]}
      />

      <div>
        <label
          htmlFor="partnershipInterest"
          className="mb-2 block text-sm font-semibold text-on-surface"
        >
          Tell us briefly what kind of products or partnerships you’re seeking:
        </label>
        <textarea
          id="partnershipInterest"
          name="partnershipInterest"
          rows={5}
          className={`${FIELD_CLASS} resize-y`}
        />
      </div>

      <RadioGroup
        legend="How did you get to know about this Expo?"
        name="referralSource"
        options={REFERRAL_SOURCE_OPTIONS}
        onChange={(value) => {
          setSelectedReferralSource(value)
          updateGroupError("referralSourceOther")
        }}
      />

      {selectedReferralSource === "Other" ? (
        <OtherField
          id="referralSourceOther"
          label="Other source"
          name="referralSourceOther"
          error={groupErrors.referralSourceOther}
          onChange={() => updateGroupError("referralSourceOther")}
        />
      ) : null}

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-on-surface">
          Terms &amp; Conditions
        </legend>
        <label className="flex cursor-pointer items-start gap-3 text-sm text-on-surface-variant">
          <input
            type="checkbox"
            name="privacyConsent"
            required
            className={`${CHECKBOX_CLASS} mt-0.5`}
          />
          <span>
            I agree to our{" "}
            <Link
              href="/privacy-policy"
              className="font-semibold text-primary underline underline-offset-2 transition-colors hover:text-primary-container"
            >
              Privacy Policy
            </Link>
            . <span className="font-semibold text-primary">* REQUIRED</span>
          </span>
        </label>
      </fieldset>

      {status ? (
        <p
          role={status.type === "error" ? "alert" : "status"}
          aria-live="polite"
          className={`rounded-xl px-4 py-3 text-sm font-medium ${
            status.type === "success"
              ? "bg-secondary-fixed text-on-secondary-container"
              : "bg-red-50 text-red-700"
          }`}
        >
          {status.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-8 py-4 apx-font-headline text-base font-semibold text-white transition-colors hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
      >
        {isSubmitting ? "Submitting..." : "Submit"}
      </button>
    </form>
  )
}

function TextField({
  id,
  inputMode,
  label,
  maxLength,
  name,
  pattern,
  placeholder,
  required,
  type = "text",
}: {
  id: string
  inputMode?: "numeric"
  label: string
  maxLength?: number
  name: string
  pattern?: string
  placeholder?: string
  required?: boolean
  type?: "email" | "text"
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold text-on-surface"
      >
        {label}
        {required ? <span className="text-primary"> *</span> : null}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        inputMode={inputMode}
        pattern={pattern}
        maxLength={maxLength}
        placeholder={placeholder}
        required={required}
        className={FIELD_CLASS}
      />
    </div>
  )
}

function CheckboxGroup<T extends readonly string[]>({
  error,
  legend,
  name,
  onChange,
  options,
  selectedOptions,
}: {
  error?: string
  legend: string
  name: "industries" | "businessTypes"
  onChange: (
    _group: "industries" | "businessTypes",
    _value: T[number],
    _checked: boolean
  ) => void
  options: T
  selectedOptions: string[]
}) {
  return (
    <fieldset
      aria-describedby={error ? `${name}-error` : undefined}
      className="space-y-3"
    >
      <legend className="text-sm font-semibold text-on-surface">
        {legend} <span className="text-primary">*</span>
      </legend>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {options.map((option) => (
          <label
            key={option}
            className="flex cursor-pointer items-center gap-3 rounded-lg border border-outline-variant/20 px-3 py-3 text-sm text-on-surface-variant transition-colors hover:border-primary/50 hover:bg-primary-fixed/30"
          >
            <input
              type="checkbox"
              name={name}
              value={option}
              checked={selectedOptions.includes(option)}
              onChange={(event) => onChange(name, option, event.target.checked)}
              className={CHECKBOX_CLASS}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
      {error ? (
        <p id={`${name}-error`} role="alert" className="text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </fieldset>
  )
}

function OtherField({
  error,
  id,
  label,
  name,
  onChange,
}: {
  error?: string
  id: string
  label: string
  name: string
  onChange: () => void
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold text-on-surface"
      >
        {label} <span className="text-primary">*</span>
      </label>
      <input
        id={id}
        name={name}
        placeholder="Please type another option here"
        aria-invalid={Boolean(error)}
        onChange={onChange}
        className={FIELD_CLASS}
      />
      {error ? (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  )
}

function RadioGroup<T extends readonly string[]>({
  defaultValue,
  legend,
  name,
  onChange,
  options,
}: {
  defaultValue?: T[number]
  legend: string
  name: "lookingFor" | "referralSource"
  onChange?: (_value: T[number]) => void
  options: T
}) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold text-on-surface">
        {legend} <span className="text-primary">*</span>
      </legend>
      <div className="space-y-3">
        {options.map((option, index) => (
          <label
            key={option}
            className="flex cursor-pointer items-center gap-3 text-sm text-on-surface-variant"
          >
            <input
              type="radio"
              name={name}
              value={option}
              defaultChecked={defaultValue === option}
              required={index === 0}
              onChange={() => onChange?.(option)}
              className="size-5 shrink-0 border-outline-variant accent-primary"
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

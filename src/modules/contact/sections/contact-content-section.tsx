import { ChevronDown, Mail, MapPin, Phone, Send } from "lucide-react"
import type { ReactNode } from "react"

const GOOGLE_MAP_EMBED_URL =
  "https://www.google.com/maps?q=Surat%2C%20Gujarat%2C%20India&z=12&hl=en&gl=IN&output=embed"

const CONTACT_EMAIL = "contact@apindexpharma.com"

const CONTACT_ITEMS = [
  {
    label: "Corporate Office",
    value: (
      <>
        Surat, Gujarat
        <br />
        India
      </>
    ),
    icon: MapPin,
    tone: "primary",
    subtext: null,
  },
  {
    label: "Direct Line",
    value: "+91 2345678900",
    icon: Phone,
    tone: "secondary",
    subtext: "Mon - Sat, 10am - 6pm IST",
  },
  {
    label: "Inquiries",
    value: CONTACT_EMAIL,
    icon: Mail,
    tone: "primary",
    subtext: "Product, partnership, and export inquiries",
  },
] as const

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

function buildCountryOptions(): string[] {
  const displayNames = new Intl.DisplayNames(["en"], { type: "region" })
  const countryNames = ISO_COUNTRY_CODES.map((code) => displayNames.of(code))
    .filter((country): country is string => Boolean(country))
    .sort((a, b) => a.localeCompare(b))

  return [...countryNames, "Other"]
}

const COUNTRIES = buildCountryOptions()

const ICON_TONE_CLASS = {
  primary: "text-primary",
  secondary: "text-secondary",
} as const

const FIELD_CLASS =
  "w-full rounded-xl border border-outline-variant/25 bg-white px-4 py-3.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-2 focus:ring-primary/15"

export default function ContactContentSection() {
  return (
    <section className="bg-surface py-16">
      <div className="content-container">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-stretch lg:gap-16">
          <div className="flex flex-col gap-10 lg:col-span-5">
            <div className="shrink-0">
              <h2 className="apx-font-headline mb-8 text-2xl sm:text-3xl font-semibold text-on-surface">
                Corporate Office
              </h2>
              <div className="space-y-8">
                {CONTACT_ITEMS.map((item) => {
                  const Icon = item.icon

                  return (
                    <div key={item.label} className="group flex items-start gap-6">
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-surface-high">
                        <Icon className={`size-5 ${ICON_TONE_CLASS[item.tone]}`} strokeWidth={2} />
                      </div>
                      <div>
                        <h3 className="apx-font-headline mb-1 text-sm font-semibold uppercase tracking-wider text-on-surface-variant">
                          {item.label}
                        </h3>
                        <p className="text-lg leading-[1.65] text-on-surface">
                          {item.value}
                        </p>
                        {item.subtext ? (
                          <p className="mt-1 text-sm text-on-surface-variant">
                            {item.subtext}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="ambient-shadow relative min-h-72 flex-1 overflow-hidden rounded-2xl bg-surface-high">
              <iframe
                title="Apindex Corporate Office Map"
                src={GOOGLE_MAP_EMBED_URL}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 h-full w-full border-0 saturate-[1.15] contrast-[1.02]"
              />
            </div>
          </div>

          <div className="lg:col-span-7">
            <div
              id="contact-form"
              className="h-full rounded-2xl border border-outline-variant/15 bg-white p-6 sm:p-10"
            >
              <div className="mb-8">
                <h2 className="apx-font-headline sm:text-3xl text-2xl font-semibold text-on-surface">
                  Send an Inquiry
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-on-surface-variant md:text-base">
                  Share your requirement and our team will respond with the
                  right product, partnership, or export support.
                </p>
              </div>

              <form
                action={`mailto:${CONTACT_EMAIL}`}
                method="post"
                encType="text/plain"
                className="space-y-5"
              >
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <Field label="Full Name">
                    <input
                      aria-label="Full Name"
                      name="full_name"
                      type="text"
                      placeholder="Your name"
                      className={FIELD_CLASS}
                    />
                  </Field>
                  <Field label="Work Email">
                    <input
                      aria-label="Work Email"
                      name="work_email"
                      type="email"
                      placeholder="name@company.com"
                      className={FIELD_CLASS}
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
                    />
                  </Field>
                  <Field label="Country">
                    <div className="relative">
                      <select
                        aria-label="Country"
                        name="country"
                        defaultValue="India"
                        className={`${FIELD_CLASS} appearance-none pr-12`}
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
                  />
                </Field>

                <div className="pt-3">
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-3 rounded-xl bg-primary px-8 py-4 apx-font-headline text-base font-semibold text-white transition-colors hover:bg-primary-container md:w-auto"
                  >
                    Submit Message
                    <Send className="h-5 w-5" strokeWidth={2.4} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
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

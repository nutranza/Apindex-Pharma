import { Mail, MapPin, Phone } from "lucide-react"

import ContactInquiryForm from "@modules/contact/components/contact-inquiry-form"

const GOOGLE_MAP_EMBED_URL =
  "https://www.google.com/maps?q=401%2C%20Rudra%20Diamond%2C%20Near%20Zalal%20Liquid%2C%20Near%20Kiran%20Hospital%2C%20Katargam%2C%20Surat%2C%20Gujarat%2C%20India&z=17&hl=en&gl=IN&output=embed"

const CONTACT_EMAIL = "info@apindexpharma.com"

const CONTACT_ITEMS = [
  {
    label: "Corporate Office",
    value: (
      <>
        401, Rudra Diamond, Near Zalal Liquid, Near Kiran Hospital, Katargam,
        Surat
      </>
    ),
    icon: MapPin,
    tone: "primary",
    subtext: null,
  },
  {
    label: "Direct Line",
    value: "+91 7698743840",
    icon: Phone,
    tone: "secondary",
    subtext: "Mon - Sun, 10am - 6pm IST",
  },
  {
    label: "Inquiries",
    value: CONTACT_EMAIL,
    icon: Mail,
    tone: "primary",
    subtext: "Product, partnership, and export inquiries",
  },
] as const

const ICON_TONE_CLASS = {
  primary: "text-primary",
  secondary: "text-secondary",
} as const

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
                    <div
                      key={item.label}
                      className="group flex items-start gap-6"
                    >
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-surface-high">
                        <Icon
                          className={`size-5 ${ICON_TONE_CLASS[item.tone]}`}
                          strokeWidth={2}
                        />
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

              <ContactInquiryForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

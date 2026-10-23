import { Mail, MapPin, Phone } from "lucide-react"

import { COMPANY_ADDRESS_TEXT } from "@/modules/company/constants"
import ContactInquiryForm from "@modules/contact/components/contact-inquiry-form"

const GOOGLE_MAP_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3719.3077316085414!2d72.8343655759732!3d21.21964238119365!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be04f9e6275b2c9%3A0xed53fcb5ea9a4475!2sAPINDEX%20PHARMACEUTICALS%20PVT.%20LTD.!5e0!3m2!1sen!2sin!4v1792667178983!5m2!1sen!2sin"

const CONTACT_EMAIL = "info@apindexpharma.com"

const CONTACT_ITEMS = [
  {
    label: "Corporate Office",
    value: COMPANY_ADDRESS_TEXT,
    icon: MapPin,
    tone: "primary",
  },
  {
    label: "Direct Line",
    value: "+91 7698743840",
    icon: Phone,
    tone: "secondary",
  },
  {
    label: "Inquiries",
    value: CONTACT_EMAIL,
    icon: Mail,
    tone: "primary",
  },
] as const

const ICON_TONE_CLASS = {
  primary: "text-primary",
  secondary: "text-secondary",
} as const

export default function ContactContentSection() {
  return (
    <section className="bg-surface apx-section">
      <div className="content-container">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-stretch lg:gap-16">
          <div className="flex flex-col gap-10 lg:col-span-5">
            <div className="shrink-0">
              <h2 className="apx-card-title mb-8 text-2xl sm:text-3xl">
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
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
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
                <h2 className="apx-card-title text-2xl sm:text-3xl">
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

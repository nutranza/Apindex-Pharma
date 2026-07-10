import { ExternalLink, FileText } from "lucide-react"

type CompanyDocument = {
  title: string
  summary: string
  href: string
  status: string
  meta: {
    label: string
    value: string
  }[]
}

const COMPANY_DOCUMENTS: CompanyDocument[] = [
  {
    title: "Drug License - Forms 20B & 21B",
    summary:
      "Wholesale drug license documentation issued through the Food & Drugs Control Administration, Surat.",
    href: "/assets/pdf/DL%20APINDEX%20PHARMA%20KATARGAM.pdf",
    status: "Active license",
    meta: [
      {
        label: "License Nos",
        value: "200324, 200325",
      },
      {
        label: "Issue / Renew From",
        value: "08/12/2022",
      },
      {
        label: "Valid Upto",
        value: "07/12/2027",
      },
    ],
  },
  {
    title: "MSME Udyam Registration Certificate",
    summary:
      "Government of India Udyam registration certificate for Apindex Pharmaceuticals Private Limited.",
    href: "/assets/pdf/MSME%20UPDATED%20CERTIFICATE%202026-27.pdf",
    status: "Registered MSME",
    meta: [
      {
        label: "Udyam No",
        value: "UDYAM-GJ-22-0175174",
      },
      {
        label: "Enterprise Type",
        value: "Micro, 2026-27",
      },
      {
        label: "Registration Date",
        value: "10/08/2022",
      },
    ],
  },
]

export default function AboutCompanyDocumentsSection() {
  return (
    <section
      id="credentials"
      className="scroll-mt-28 bg-surface-low py-14 lg:py-24"
    >
      <div className="content-container">
        <div className="mb-10 max-w-3xl">
          <div className="max-w-3xl">
            <p className="mb-3 text-sm font-extrabold uppercase tracking-[0.14em] text-primary">
              Credentials & Documents
            </p>
            <h2 className="section-heading">Public Company Documents</h2>
            <p className="mt-4 max-w-2xl section-description">
              Review Apindex Pharmaceuticals&apos; key business credentials for
              vendor verification, procurement, and compliant pharmaceutical
              sourcing.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {COMPANY_DOCUMENTS.map((document) => (
            <article
              key={document.title}
              className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white p-6"
            >
              <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primary to-secondary" />

              <div className="mb-6 flex items-start justify-between gap-4">
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary-fixed text-primary ring-1 ring-primary/10">
                  <FileText
                    aria-hidden="true"
                    className="size-6"
                    strokeWidth={1.8}
                  />
                </div>
                <span className="rounded-full bg-secondary-fixed/55 px-3 py-1 text-xs font-extrabold text-on-secondary-container">
                  {document.status}
                </span>
              </div>

              <h3 className="text-xl font-extrabold leading-tight text-on-surface sm:text-[1.35rem]">
                {document.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-on-surface-variant sm:min-h-[48px]">
                {document.summary}
              </p>

              <dl className="mt-6 grid gap-3 rounded-xl border border-outline-variant/35 bg-surface-lowest p-4">
                {document.meta.map((item) => (
                  <div
                    key={item.label}
                    className="grid gap-1 text-sm sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-4"
                  >
                    <dt className="font-medium text-on-surface-variant">
                      {item.label}
                    </dt>
                    <dd className="font-extrabold text-on-surface">
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-auto pt-4">
                <a
                  href={document.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-extrabold text-white transition-colors hover:bg-primary-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:w-auto"
                >
                  View PDF
                  <ExternalLink
                    aria-hidden="true"
                    className="size-4 text-white"
                    strokeWidth={2}
                  />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

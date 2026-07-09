import { ExternalLink, FileText, ShieldCheck } from "lucide-react"

type CompanyDocument = {
  title: string
  summary: string
  href: string
  meta: string[]
}

const COMPANY_DOCUMENTS: CompanyDocument[] = [
  {
    title: "Drug License - Forms 20B & 21B",
    summary:
      "Wholesale drug license documentation issued through the Food & Drugs Control Administration, Surat.",
    href: "/assets/pdf/DL%20APINDEX%20PHARMA%20KATARGAM.pdf",
    meta: [
      "License Nos: 200324, 200325",
      "Issue/Renew From: 08/12/2022",
      "Valid Upto: 07/12/2027",
    ],
  },
  {
    title: "MSME Udyam Registration Certificate",
    summary:
      "Government of India Udyam registration certificate for Apindex Pharmaceuticals Private Limited.",
    href: "/assets/pdf/MSME%20UPDATED%20CERTIFICATE%202026-27.pdf",
    meta: [
      "Udyam No: UDYAM-GJ-22-0175174",
      "Enterprise Type: Micro, 2026-27",
      "Registration Date: 10/08/2022",
    ],
  },
]

export default function AboutCompanyDocumentsSection() {
  return (
    <section
      id="credentials"
      className="scroll-mt-28 bg-surface-low py-14 lg:py-20"
    >
      <div className="content-container">
        <div className="mb-10 flex max-w-3xl flex-col gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck
              aria-hidden="true"
              className="size-9 text-secondary"
              strokeWidth={1.8}
            />
            <p className="text-sm font-extrabold uppercase tracking-[0.12em] text-primary">
              Credentials & Documents
            </p>
          </div>
          <h2 className="section-heading">Public Company Documents</h2>
          <p className="section-description">
            View Apindex Pharmaceuticals licensing and registration documents
            that support transparent, compliant pharmaceutical supply.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {COMPANY_DOCUMENTS.map((document) => (
            <article
              key={document.title}
              className="flex h-full flex-col rounded-lg border border-outline-variant/50 bg-white p-6 shadow-[0_18px_45px_rgba(86,67,54,0.08)]"
            >
              <div className="mb-5 flex size-12 items-center justify-center rounded-lg bg-primary-fixed text-primary">
                <FileText
                  aria-hidden="true"
                  className="size-6"
                  strokeWidth={1.8}
                />
              </div>

              <h3 className="text-xl font-extrabold leading-tight text-on-surface">
                {document.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-on-surface-variant">
                {document.summary}
              </p>

              <ul className="mt-5 space-y-2 text-sm font-medium leading-6 text-on-surface">
                {document.meta.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              <div className="mt-6 pt-2">
                <a
                  href={document.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-extrabold text-white transition-colors hover:bg-primary-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  View PDF
                  <ExternalLink
                    aria-hidden="true"
                    className="size-4"
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
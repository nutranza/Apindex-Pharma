import type { Metadata } from "next"

import LegalPageTemplate from "@modules/legal/templates/legal-page-template"

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description:
    "Read the draft terms and conditions for Apindex Pharmaceuticals website and business inquiries.",
}

const TERMS_SECTIONS = [
  {
    title: "1. Draft policy notice",
    paragraphs: [
      "This page is a simple draft for website structure and will be replaced or revised with client-approved legal terms before final publication.",
    ],
  },
  {
    title: "2. Website information",
    paragraphs: [
      "Website content is provided for general professional and business communication. Product availability, specifications, pricing, documents, and supply terms must be confirmed separately in writing.",
    ],
  },
  {
    title: "3. Business inquiries",
    paragraphs: [
      "Submitting an inquiry does not create a purchase order, contract, agency relationship, or guarantee of product supply. Apindex may request additional information before preparing a quotation or business proposal.",
    ],
  },
  {
    title: "4. Acceptable use",
    bullets: [
      "Use the website and contact form for lawful professional and business purposes.",
      "Do not submit misleading, unlawful, harmful, or unauthorized information.",
      "Do not attempt to interfere with the security, availability, or operation of the website.",
    ],
  },
  {
    title: "5. Contact",
    paragraphs: [
      "For questions about these draft terms, email info@apindexpharma.com or use the Contact page.",
    ],
  },
]

export default function TermsAndConditionsPage() {
  return (
    <LegalPageTemplate
      eyebrow="Draft Business Policy"
      title="Terms and Conditions"
      description="General draft terms for using the Apindex Pharmaceuticals website and submitting professional business inquiries."
      lastUpdated="28 September 2026"
      summaryItems={[
        "Website information is general and must be confirmed in writing.",
        "An inquiry does not itself create a purchase contract.",
        "Final commercial and legal terms will be agreed separately.",
      ]}
      sections={TERMS_SECTIONS}
    />
  )
}

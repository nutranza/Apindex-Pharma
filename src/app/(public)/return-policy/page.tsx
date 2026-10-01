import type { Metadata } from "next"

import LegalPageTemplate from "@modules/legal/templates/legal-page-template"

export const metadata: Metadata = {
  title: "Return Policy",
  description:
    "Read the draft return policy for Apindex Pharmaceuticals business supply and product concerns.",
}

const RETURN_SECTIONS = [
  {
    title: "1. Draft policy notice",
    paragraphs: [
      "This page is a simple draft for website structure and will be updated with client-approved return and complaint-handling terms before final publication.",
    ],
  },
  {
    title: "2. Business supply review",
    paragraphs: [
      "Product concerns must be reported to Apindex promptly after delivery with the order reference, batch information, photographs where relevant, and a clear description of the issue.",
    ],
  },
  {
    title: "3. Product and documentation checks",
    paragraphs: [
      "Return, replacement, credit, or other resolution options depend on the product type, agreed commercial terms, transport condition, documentation, and the outcome of the review.",
    ],
  },
  {
    title: "4. Contact for support",
    paragraphs: [
      "For a product concern, contact info@apindexpharma.com with the relevant order and shipment details so the team can review the matter.",
    ],
  },
]

export default function ReturnPolicyPage() {
  return (
    <LegalPageTemplate
      eyebrow="Draft Business Policy"
      title="Return Policy"
      description="General information for product concerns and business supply review. Final return terms will be confirmed in writing for each order."
      lastUpdated="28 September 2026"
      summaryItems={[
        "Report product concerns promptly after delivery.",
        "Keep order, batch, shipment, and supporting evidence available.",
        "Resolution depends on the approved commercial terms and review.",
      ]}
      sections={RETURN_SECTIONS}
    />
  )
}

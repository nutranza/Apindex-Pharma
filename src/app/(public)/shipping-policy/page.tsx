import type { Metadata } from "next"

import LegalPageTemplate from "@modules/legal/templates/legal-page-template"

export const metadata: Metadata = {
  title: "Shipping Policy",
  description:
    "Read the draft shipping policy for Apindex Pharmaceuticals business orders and supply coordination.",
}

const SHIPPING_SECTIONS = [
  {
    title: "1. Draft policy notice",
    paragraphs: [
      "This page is a simple draft for website structure and will be updated with client-approved shipping terms before final publication.",
    ],
  },
  {
    title: "2. Business shipment coordination",
    paragraphs: [
      "Shipping arrangements, delivery timelines, documentation, freight responsibility, and destination requirements are confirmed separately for each approved business order.",
    ],
  },
  {
    title: "3. Destination requirements",
    paragraphs: [
      "Buyers are responsible for sharing accurate consignee, import, licensing, and destination information required for the intended market. Additional documentation may be required before dispatch.",
    ],
  },
  {
    title: "4. Delays and exceptions",
    paragraphs: [
      "Delivery may be affected by product availability, regulatory review, customs, carrier schedules, weather, public events, or other circumstances outside the direct control of Apindex.",
    ],
  },
]

export default function ShippingPolicyPage() {
  return (
    <LegalPageTemplate
      eyebrow="Draft Business Policy"
      title="Shipping Policy"
      description="General shipping and delivery information for pharmaceutical business supply discussions. Final terms will be confirmed in writing for each order."
      lastUpdated="28 September 2026"
      summaryItems={[
        "Business orders are coordinated individually.",
        "Destination and import requirements must be confirmed before dispatch.",
        "Final shipping terms will be shared with the approved quotation or order.",
      ]}
      sections={SHIPPING_SECTIONS}
    />
  )
}

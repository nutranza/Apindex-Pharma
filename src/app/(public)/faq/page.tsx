import type { Metadata } from "next"

import FaqPageTemplate from "@modules/faq/templates/faq-page"

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about Apindex pharmaceutical supply, products, documents, and partnerships.",
}

export default function FaqPage() {
  return <FaqPageTemplate />
}

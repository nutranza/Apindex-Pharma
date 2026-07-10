import type { Metadata } from "next"

import LegalPageTemplate from "@modules/legal/templates/legal-page-template"

export const metadata: Metadata = {
  title: "Disclaimer",
  description:
    "Read the website disclaimer for Apindex Pharmaceuticals product, manufacturing, trading, and business information.",
}

const DISCLAIMER_SECTIONS = [
  {
    title: "1. General business information",
    paragraphs: [
      "The information on this website is provided by Apindex Pharmaceuticals Pvt. Ltd. for general B2B business awareness. It supports professional discussions related to pharmaceutical sourcing, finished formulations, contract manufacturing, trading, documentation, and export-ready supply.",
      "The website content should not be treated as a final commercial offer, regulatory approval, technical dossier, product specification, quality certificate, or binding commitment unless confirmed separately in writing by Apindex.",
    ],
  },
  {
    title: "2. No medical advice",
    paragraphs: [
      "This website does not provide medical advice, diagnosis, treatment guidance, prescription guidance, or patient-specific recommendations. Product and category references are intended for qualified business and healthcare supply-chain discussions only.",
      "Patients and individual consumers should consult a qualified healthcare professional for medical questions and should not rely on this website for self-medication or treatment decisions.",
    ],
  },
  {
    title: "3. Product and regulatory limitations",
    bullets: [
      "Product information, images, categories, compositions, strengths, packaging, availability, and supply terms may change without notice.",
      "Manufacturing, trading, export, and finished formulation supply are subject to applicable licenses, registrations, regulatory approvals, buyer qualification, documentation, commercial terms, and product availability.",
      "No statement on this website should be interpreted as a guarantee of therapeutic effect, cure, safety, efficacy, regulatory approval, uninterrupted supply, or market availability.",
    ],
  },
  {
    title: "4. Documentation and quality references",
    paragraphs: [
      "Any references to licenses, certificates, quality systems, documentation, or compliance processes are provided for business verification and trust-building. Final reliance should be based on current documents, written confirmations, purchase terms, and applicable regulatory requirements.",
    ],
  },
  {
    title: "5. External links and embedded services",
    paragraphs: [
      "The website may include links, maps, documents, or embedded third-party services for convenience. Apindex does not control third-party websites or services and is not responsible for their content, availability, privacy practices, or accuracy.",
    ],
  },
  {
    title: "6. Accuracy and updates",
    paragraphs: [
      "We aim to keep website information clear and reliable, but errors, omissions, outdated details, or typographical mistakes may occur. Apindex may update, modify, remove, or replace website content at any time without prior notice.",
    ],
  },
  {
    title: "7. Limitation of liability",
    paragraphs: [
      "To the fullest extent permitted by applicable law, Apindex Pharmaceuticals Pvt. Ltd. will not be liable for losses arising from reliance on general website information without independent verification, written confirmation, and appropriate professional, commercial, regulatory, or legal review.",
    ],
  },
]

export default function DisclaimerPage() {
  return (
    <LegalPageTemplate
      eyebrow="Website Disclaimer"
      title="Disclaimer"
      description="Important limitations for Apindex Pharmaceuticals website content, product information, and B2B pharma communication."
      lastUpdated="10 July 2026"
      summaryItems={[
        "Website content is for professional B2B information only.",
        "Product details are subject to documentation, approvals, and availability.",
        "Nothing on the site should be read as medical advice or a treatment claim.",
      ]}
      sections={DISCLAIMER_SECTIONS}
    />
  )
}

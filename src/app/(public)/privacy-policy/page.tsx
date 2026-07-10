import type { Metadata } from "next"

import LegalPageTemplate from "@modules/legal/templates/legal-page-template"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read how Apindex Pharmaceuticals handles website inquiries, business contact details, and privacy-related requests.",
}

const PRIVACY_SECTIONS = [
  {
    title: "1. About this Privacy Policy",
    paragraphs: [
      "This Privacy Policy explains how Apindex Pharmaceuticals Pvt. Ltd. handles information submitted through this website for product, partnership, finished formulation, contract manufacturing, trading, and export-related business inquiries.",
      "This website is intended for business users, healthcare procurement teams, distributors, institutions, and other professional partners. It is not intended to collect patient health information or provide medical advice.",
    ],
  },
  {
    title: "2. Information we collect",
    paragraphs: [
      "When you submit an inquiry, we may collect the details you provide in the form and related business communication.",
    ],
    bullets: [
      "Full name, work email address, phone number, country, company or business context, and inquiry message.",
      "Product, partnership, manufacturing, export, documentation, or sourcing requirements included in your message.",
      "Basic technical and security information that may be processed by our website, hosting, analytics, or email systems to keep the website reliable and secure.",
    ],
  },
  {
    title: "3. How we use information",
    bullets: [
      "To respond to inquiries and coordinate product, partnership, export, documentation, or business discussions.",
      "To prepare follow-up communication, quotations, commercial discussions, and business records where applicable.",
      "To operate, protect, improve, and troubleshoot the website and inquiry workflow.",
      "To comply with applicable legal, regulatory, quality, tax, accounting, or business record requirements.",
    ],
  },
  {
    title: "4. Sharing of information",
    paragraphs: [
      "We do not sell personal information. We may share relevant inquiry details only when needed for legitimate business, operational, legal, or compliance purposes.",
    ],
    bullets: [
      "With Apindex team members who need the information to respond to your inquiry.",
      "With service providers such as hosting, email, security, analytics, or communication providers that help operate the website and inquiry process.",
      "With professional advisors, regulators, government authorities, or law enforcement when required by applicable law or to protect our rights.",
    ],
  },
  {
    title: "5. Data retention",
    paragraphs: [
      "We retain inquiry and business communication records only for as long as reasonably required for the purpose for which they were collected, for ongoing business communication, or for legal, regulatory, tax, accounting, quality, or dispute-resolution requirements.",
    ],
  },
  {
    title: "6. Your choices and requests",
    paragraphs: [
      "You may contact us to request access, correction, deletion, withdrawal of consent, or clarification about how your information is handled. We will review requests in line with applicable law, business record needs, and regulatory obligations.",
    ],
  },
  {
    title: "7. Cookies and third-party services",
    paragraphs: [
      "Our website may use basic cookies, embedded maps, hosting tools, analytics, security tools, or third-party services to provide website functionality, measure performance, protect the website, and improve the user experience.",
    ],
  },
  {
    title: "8. Security",
    paragraphs: [
      "We use reasonable administrative, technical, and organizational measures to protect information submitted through the website. No website, email, or internet transmission can be guaranteed to be completely secure.",
    ],
  },
  {
    title: "9. Updates to this policy",
    paragraphs: [
      "We may update this Privacy Policy from time to time to reflect changes in our website, business practices, legal requirements, or operational processes. The updated date on this page will indicate the latest version.",
    ],
  },
]

export default function PrivacyPolicyPage() {
  return (
    <LegalPageTemplate
      eyebrow="Privacy Notice"
      title="Privacy Policy"
      description="How Apindex Pharmaceuticals handles business inquiry details and website-related personal information."
      lastUpdated="10 July 2026"
      summaryItems={[
        "Built for B2B product, manufacturing, trading, and export inquiries.",
        "Explains what contact details we collect and why we use them.",
        "Gives a clear contact path for privacy questions and requests.",
      ]}
      sections={PRIVACY_SECTIONS}
    />
  )
}

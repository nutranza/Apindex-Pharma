import type { Metadata } from "next"

import VisitorRegistrationPageTemplate from "@modules/visitor-registration/templates/visitor-registration-page"

export const metadata: Metadata = {
  title: "Nairobi Expo Visitor Registration",
  description:
    "Register to visit the 7th International Indo-Africa B2B Trade Expo & Investment Summit in Nairobi.",
}

export default function NairobiExpoPage() {
  return <VisitorRegistrationPageTemplate />
}

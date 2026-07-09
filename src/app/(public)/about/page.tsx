import type { Metadata } from "next"
import AboutPageTemplate from "@modules/about/templates/about-page"

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Apindex Pharmaceuticals, its company credentials, public licenses, global footprint, and quality systems.",
}

export default function AboutPage() {
  return <AboutPageTemplate />
}

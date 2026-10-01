import type { Metadata } from "next"

import BlogPageTemplate from "@modules/blog/templates/blog-page"

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Pharmaceutical supply, quality, documentation, and partnership insights from Apindex Pharmaceuticals.",
}

export default function BlogPage() {
  return <BlogPageTemplate />
}

import Image from "next/image"
import Link from "next/link"

import { BLOG_POSTS } from "@modules/blog/constants"
import PageHeroSection from "@modules/common/components/page-hero-section"

export default function BlogPageTemplate() {
  return (
    <div className="apx-landing apx-font-body bg-surface text-on-surface">
      <main className="!pb-0">
        <PageHeroSection
          title="Pharmaceutical"
          accent="Insights"
          suffix="for Better Decisions"
          description="Practical information about pharmaceutical supply, quality, documentation, and long-term healthcare partnerships."
          imageSrc="/blog-hero-pharmaceutical-insights.png"
          imageAlt="Pharmaceutical quality specialist reviewing product documentation in a laboratory"
          imageClassName="object-[66%_center] sm:object-center lg:object-[50%_top]"
        />

        <section className="bg-white apx-section">
          <div className="content-container">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {BLOG_POSTS.map((post) => (
                <article
                  key={post.slug}
                  className="apx-card group overflow-hidden apx-card-interactive"
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-surface-high">
                    <Image
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      src={post.imageUrl}
                      alt={post.imageAlt}
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <p className="text-sm font-semibold text-primary">
                      {post.category}
                    </p>
                    <h2 className="mt-3 apx-font-headline text-xl font-extrabold leading-tight">
                      {post.title}
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-on-surface-variant">
                      {post.excerpt}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-12 rounded-2xl bg-primary-fixed p-6 sm:p-8">
              <h2 className="apx-font-headline text-2xl font-extrabold">
                Need help with a product or supply requirement?
              </h2>
              <p className="apx-body-muted mt-3 max-w-2xl">
                Contact our team for product information, documentation, or a
                tailored pharmaceutical supply discussion.
              </p>
              <Link href="/contact" className="apx-button-primary mt-5">
                Contact Apindex
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

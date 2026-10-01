import Image from "next/image"
import Link from "next/link"

import { BLOG_POSTS } from "@modules/blog/constants"

export default function BlogPageTemplate() {
  return (
    <div className="apx-landing apx-font-body bg-surface text-on-surface">
      <main className="!pb-0 pt-20">
        <section className="bg-white py-14 lg:py-20">
          <div className="content-container">
            <div className="max-w-3xl">
              <p className="mb-3 text-sm font-extrabold uppercase tracking-[0.14em] text-primary">
                Apindex Insights
              </p>
              <h1 className="section-heading">
                Pharmaceutical <span className="text-primary">Insights</span>
              </h1>
              <p className="mt-5 section-description">
                Practical information about pharmaceutical supply, quality,
                documentation, and long-term healthcare partnerships.
              </p>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {BLOG_POSTS.map((post) => (
                <article
                  key={post.slug}
                  className="overflow-hidden rounded-2xl border border-outline-variant/20 bg-white shadow-sm"
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
              <p className="mt-3 max-w-2xl text-sm leading-6 text-on-surface-variant sm:text-base">
                Contact our team for product information, documentation, or a
                tailored pharmaceutical supply discussion.
              </p>
              <Link
                href="/contact"
                className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-container"
              >
                Contact Apindex
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

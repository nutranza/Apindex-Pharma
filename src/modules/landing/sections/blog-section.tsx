"use client"

import { useCallback, useEffect, useState } from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline"
import useEmblaCarousel from "embla-carousel-react"
import Image from "next/image"

type BlogPost = {
  category: string
  title: string
  excerpt: string
  imageUrl: string
  imageAlt: string
}

const BLOG_POSTS: BlogPost[] = [
  {
    category: "Finished Formulations",
    title: "Choosing Reliable Finished Formulation Supply",
    excerpt:
      "What pharma partners should look for when sourcing finished formulations across therapeutic categories, dosage forms, and long-term supply needs.",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAqn5mGy4tBW7R-mFwByWYGx2rc1xuPI8beh1p8OKwZb1nhKY9ANVEOWgYA97BhbNqskkNwVBPGjRk5paTpQSFnonLojpwaXbtJAmUl8Ui4zynW85S7UMzIUAdOVgYRU9ALRRaYWKL4v7PQkgjxKH5GfoDjEWGFQWYJ0_MP8ZVVo2u0pIVOBf5c5Oty3TXeJG3YDF7eO21qn2JTMnRRM1N-Dc9FvSF3zNQhKIoOWJatBRZDKZU8TnTqRrr4QyBdgxhfqyRbYSYbgZI",
    imageAlt:
      "Modern pharmaceutical facility supporting finished formulation supply",
  },
  {
    category: "Contract Support",
    title: "Contract Manufacturing Support for Pharma Brands",
    excerpt:
      "A practical look at how coordinated manufacturing support, quality documentation, and supply planning help brands scale without building every capability in-house.",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD2wBwbxNQrbVjfUwAbA4_lX2b5eNFLpfHpbcLTPbHXBzizt8YKT7uUMWR7_Dh1YXHm6NsVgJIv5hAPNRp77WwbBdn6ENp0h9n10xkdJF_bLkNv1X3Nbz3CMpkoA5YLGBGjjvVk0sQadHx7r-QUWm7wJrEGHzsnwl4tl5IZqdgzu453uEZJfHHA0p4UGsFF_mSxHq8S_HRTX5F8ujTCY9p_zTemplbcz32kh1-1n7K4T-KSLrFJvjqLpFvIMoF3LWrDEGHr-n0OxRw",
    imageAlt:
      "Pharmaceutical researcher reviewing quality and formulation support",
  },
  {
    category: "Export Readiness",
    title: "Why Documentation Matters in Pharma Export Supply",
    excerpt:
      "Clear product records, GMP alignment, and export-ready documentation help pharmaceutical partners move finished products with greater confidence.",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBMNz_jUhspacjupHGXN9NyESzVjiNYyW1181AkmHNdM_zJQZfvbjDM0jyXE0FSiEgHRoRJFYtNH33bKIhf0f0zrMXmSjJ64IOQDY__U5hocGlByFF78fj5a3PKxjvNGTCiV6wz72Nlw-SbAT-6yUzOM5n7ItGoEvTlRJG1op3Wfgj88bBBSEaDop0zrUt2YT5BXkpB4nCYYI7oPFVI01dsQi7UAaNUiX309pFAkOw28YjH3UbwhixwDnzTlHlOwBfDKJE8jYMYeyI",
    imageAlt:
      "World map representing export-ready pharmaceutical supply support",
  },
]

export default function BlogSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    loop: false,
    skipSnaps: false,
  })
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext()
  }, [emblaApi])

  const updateCarouselState = useCallback(() => {
    if (!emblaApi) {
      return
    }

    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) {
      return
    }

    updateCarouselState()
    emblaApi.on("select", updateCarouselState)
    emblaApi.on("reInit", updateCarouselState)

    return () => {
      emblaApi.off("select", updateCarouselState)
      emblaApi.off("reInit", updateCarouselState)
    }
  }, [emblaApi, updateCarouselState])

  return (
    <section id="latest-blog" className="bg-surface-low py-16 lg:py-24">
      <div className="content-container">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-12">
          <div className="max-w-2xl">
            <h2 className="section-heading">
              Latest <span className="text-primary">Blog</span>
            </h2>
            <p className="mt-4 section-description">
              Practical insights on pharmaceutical manufacturing, quality, and
              global supply.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Show previous blog posts"
              disabled={!canScrollPrev}
              onClick={scrollPrev}
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-outline-variant/40 bg-white text-on-surface disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ChevronLeftIcon className="h-5 w-5" strokeWidth={2.6} />
            </button>
            <button
              type="button"
              aria-label="Show next blog posts"
              disabled={!canScrollNext}
              onClick={scrollNext}
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-outline-variant/40 bg-white text-on-surface disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ChevronRightIcon className="h-5 w-5" strokeWidth={2.6} />
            </button>
          </div>
        </div>

        <div ref={emblaRef} className="overflow-hidden">
          <div className="-ml-5 flex touch-pan-y">
            {BLOG_POSTS.map((post) => (
              <article
                key={post.title}
                className="min-w-0 flex-[0_0_100%] pl-5 sm:flex-[0_0_50%] lg:flex-[0_0_33.333%]"
              >
                <div className="h-full overflow-hidden rounded-xl bg-white">
                  <div className="relative aspect-[16/9] overflow-hidden bg-surface-high">
                    <Image
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      src={post.imageUrl}
                      alt={post.imageAlt}
                      className="object-cover"
                    />
                  </div>

                  <div className="p-5">
                    <p className="mb-3 text-sm font-semibold text-primary">
                      {post.category}
                    </p>
                    <h3 className="apx-font-headline text-xl font-extrabold leading-tight text-on-surface lg:text-2xl">
                      {post.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-on-surface-variant">
                      {post.excerpt}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

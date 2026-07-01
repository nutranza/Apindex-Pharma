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
    category: "Manufacturing",
    title: "Third-Party Manufacturing for Pharma Brands",
    excerpt:
      "How trusted manufacturing partnerships help pharma brands scale quality products without building their own plant.",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAqn5mGy4tBW7R-mFwByWYGx2rc1xuPI8beh1p8OKwZb1nhKY9ANVEOWgYA97BhbNqskkNwVBPGjRk5paTpQSFnonLojpwaXbtJAmUl8Ui4zynW85S7UMzIUAdOVgYRU9ALRRaYWKL4v7PQkgjxKH5GfoDjEWGFQWYJ0_MP8ZVVo2u0pIVOBf5c5Oty3TXeJG3YDF7eO21qn2JTMnRRM1N-Dc9FvSF3zNQhKIoOWJatBRZDKZU8TnTqRrr4QyBdgxhfqyRbYSYbgZI",
    imageAlt:
      "Modern pharmaceutical manufacturing room with sterile production equipment",
  },
  {
    category: "Quality",
    title: "Why WHO-GMP Standards Matter",
    excerpt:
      "A practical look at how process discipline, documentation, and controlled production support consistent medicine quality.",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD2wBwbxNQrbVjfUwAbA4_lX2b5eNFLpfHpbcLTPbHXBzizt8YKT7uUMWR7_Dh1YXHm6NsVgJIv5hAPNRp77WwbBdn6ENp0h9n10xkdJF_bLkNv1X3Nbz3CMpkoA5YLGBGjjvVk0sQadHx7r-QUWm7wJrEGHzsnwl4tl5IZqdgzu453uEZJfHHA0p4UGsFF_mSxHq8S_HRTX5F8ujTCY9p_zTemplbcz32kh1-1n7K4T-KSLrFJvjqLpFvIMoF3LWrDEGHr-n0OxRw",
    imageAlt:
      "Pharmaceutical researcher using a microscope in a laboratory",
  },
  {
    category: "Injectables",
    title: "Sterile Injectable Manufacturing Essentials",
    excerpt:
      "Key considerations for sterile dosage forms, from clean environments to quality checks across the production cycle.",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCAToZADVB4xM043eYneGVipKDmGjt3ph4cimJUXczxXks53ENiKA298Jr7Q3IsHTX8QPiBebYPsAjW-2R4e1lT1XBaFsKdQSYG9Dh5VKyHWZilO-h-r2fwsxA2ISz24B6DASZ-uA-GDG3nq5fs3_6RNht9AInM30W52QgIxlkFsKGLsmiBu5RdULYLhL8JfJ0Q33ayp_tgiAAA2hHYi-B9QUnozF0TUQrGnne4DzE5GdT5D71uKueghBgYsaNMVU7NaNDszMJTL-o",
    imageAlt:
      "Automated pharmaceutical production line processing capsules",
  },
  {
    category: "Partnership",
    title: "Contract Manufacturing for Global Supply",
    excerpt:
      "How scalable production planning helps distributors, institutions, and healthcare brands serve wider markets.",
    imageUrl: "/team-labs.avif",
    imageAlt:
      "Pharmaceutical laboratory team working in a modern healthcare facility",
  },
  {
    category: "Export",
    title: "Documentation for Pharmaceutical Exports",
    excerpt:
      "Clear export documentation and traceable quality records make international pharmaceutical supply more dependable.",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBMNz_jUhspacjupHGXN9NyESzVjiNYyW1181AkmHNdM_zJQZfvbjDM0jyXE0FSiEgHRoRJFYtNH33bKIhf0f0zrMXmSjJ64IOQDY__U5hocGlByFF78fj5a3PKxjvNGTCiV6wz72Nlw-SbAT-6yUzOM5n7ItGoEvTlRJG1op3Wfgj88bBBSEaDop0zrUt2YT5BXkpB4nCYYI7oPFVI01dsQi7UAaNUiX309pFAkOw28YjH3UbwhixwDnzTlHlOwBfDKJE8jYMYeyI",
    imageAlt:
      "World map representing international pharmaceutical export reach",
  },
  {
    category: "Access",
    title: "Generic Medicines and Healthcare Access",
    excerpt:
      "Why reliable generic formulations remain essential for affordable treatment programs and broad patient reach.",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAbO5BFTZN1hjOhGJtfoS0x13EgbEfgXOPVNoZZyY1zpCfpDuRCPHrqTgFwjLOrJrYVwVA1dWefxc0Ce_twA-btoUMc7aAXaJVMDjg5QcMYvcxN1e_JqcK-ys7LPgmUMUl-9d5w1zUQL23sPLl_k5T265O1djtRDRfvWdmj5ApcyLsde4GsdjF14tbT5ZCIYHElUDXwUT7XiVCZlKV9hV7Px9xYsfl2nLilniLAFK7PXx1anxeCB_Xl_TE3TYCAJIDY2fyYqOgJ2hw",
    imageAlt:
      "Validated pharmaceutical excellence represented by a modern laboratory process",
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

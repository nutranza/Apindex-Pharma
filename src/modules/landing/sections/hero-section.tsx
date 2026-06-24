"use client"

import { useCallback, useEffect, useState } from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline"
import useEmblaCarousel from "embla-carousel-react"
import Image from "next/image"

type HeroSlide = {
  eyebrow: string
  title: string
  accent: string
  suffix: string
  imageUrl: string
  imageAlt: string
  imagePosition?: string
}

const HERO_SLIDES: HeroSlide[] = [
  {
    eyebrow: "WHO-GMP Certified Manufacturing",
    title: "Your Trusted",
    accent: "Partner",
    suffix: "in Global Healthcare",
    imageUrl: "/team-labs.avif",
    imageAlt:
      "Pharmaceutical laboratory team working inside a modern healthcare facility",
  },
  {
    eyebrow: "Contract and Third Party Manufacturing",
    title: "Scalable",
    accent: "Pharma",
    suffix: "Manufacturing",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAqn5mGy4tBW7R-mFwByWYGx2rc1xuPI8beh1p8OKwZb1nhKY9ANVEOWgYA97BhbNqskkNwVBPGjRk5paTpQSFnonLojpwaXbtJAmUl8Ui4zynW85S7UMzIUAdOVgYRU9ALRRaYWKL4v7PQkgjxKH5GfoDjEWGFQWYJ0_MP8ZVVo2u0pIVOBf5c5Oty3TXeJG3YDF7eO21qn2JTMnRRM1N-Dc9FvSF3zNQhKIoOWJatBRZDKZU8TnTqRrr4QyBdgxhfqyRbYSYbgZI",
    imageAlt:
      "Modern pharmaceutical manufacturing facility with production equipment",
  },
  {
    eyebrow: "Export Ready Pharmaceutical Supply",
    title: "Quality That",
    accent: "Travels",
    suffix: "Across Markets",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCAToZADVB4xM043eYneGVipKDmGjt3ph4cimJUXczxXks53ENiKA298Jr7Q3IsHTX8QPiBebYPsAjW-2R4e1lT1XBaFsKdQSYG9Dh5VKyHWZilO-h-r2fwsxA2ISz24B6DASZ-uA-GDG3nq5fs3_6RNht9AInM30W52QgIxlkFsKGLsmiBu5RdULYLhL8JfJ0Q33ayp_tgiAAA2hHYi-B9QUnozF0TUQrGnne4DzE5GdT5D71uKueghBgYsaNMVU7NaNDszMJTL-o",
    imageAlt:
      "Automated pharmaceutical production line in a clean manufacturing environment",
    imagePosition: "object-center",
  },
]

export default function HeroSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true,
    skipSnaps: false,
  })
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext()
  }, [emblaApi])

  const scrollTo = useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index)
    },
    [emblaApi]
  )

  const onSelect = useCallback(() => {
    if (!emblaApi) {
      return
    }

    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) {
      return
    }

    setScrollSnaps(emblaApi.scrollSnapList())
    onSelect()
    emblaApi.on("select", onSelect)
    emblaApi.on("reInit", onSelect)

    return () => {
      emblaApi.off("select", onSelect)
      emblaApi.off("reInit", onSelect)
    }
  }, [emblaApi, onSelect])

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-[#0d1117] pt-20"
    >
      <div
        ref={emblaRef}
        className="overflow-hidden h-[550px] lg:h-[650px]"
      >
        <div className="flex h-full touch-pan-y">
          {HERO_SLIDES.map((slide, index) => (
            <div
              key={slide.eyebrow}
              className="relative min-w-0 flex-[0_0_100%] overflow-hidden"
            >
              <div className="absolute inset-0 z-0">
                <Image
                  fill
                  priority={index === 0}
                  sizes="100vw"
                  src={slide.imageUrl}
                  alt={slide.imageAlt}
                  className={`h-full w-full object-cover ${slide.imagePosition ?? ""}`}
                />
                <div className="absolute inset-0 bg-[#0d1117]/48" />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(13,17,23,0.86)_0%,rgba(13,17,23,0.62)_42%,rgba(13,17,23,0.2)_100%)]" />
              </div>

              <div className="relative z-10 flex h-full items-center">
                <div className="w-full max-w-3xl px-6 text-left sm:px-10 md:px-14 lg:pl-20">
                  <p className="mb-4 text-xs font-bold uppercase text-primary-container sm:text-sm">
                    {slide.eyebrow}
                  </p>
                  <h1 className="max-w-3xl text-4xl font-extrabold uppercase leading-[1.08] text-white sm:text-5xl md:text-6xl lg:text-7xl">
                    {slide.title}{" "}
                    <span className="text-primary-container">
                      {slide.accent}
                    </span>
                    <br />
                    {slide.suffix}
                  </h1>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 top-20 z-20 hidden items-center justify-between px-2 sm:flex">
        <button
          type="button"
          aria-label="Show previous hero slide"
          onClick={scrollPrev}
          className="pointer-events-auto inline-flex h-12 w-12 items-center justify-center text-white/85 focus-visible:outline-none"
        >
          <ChevronLeftIcon className="h-9 w-9" strokeWidth={3} />
        </button>
        <button
          type="button"
          aria-label="Show next hero slide"
          onClick={scrollNext}
          className="pointer-events-auto inline-flex h-12 w-12 items-center justify-center text-white/85 focus-visible:outline-none"
        >
          <ChevronRightIcon className="h-9 w-9" strokeWidth={3} />
        </button>
      </div>

      <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            type="button"
            aria-label={`Show hero slide ${index + 1}`}
            aria-current={selectedIndex === index ? "true" : undefined}
            onClick={() => scrollTo(index)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              selectedIndex === index
                ? "w-10 bg-primary-container"
                : "w-4 bg-white/45 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </section>
  )
}

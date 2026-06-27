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
    title: "Science-Led",
    accent: "Pharma",
    suffix: "Partnerships",
    imageUrl: "/slide1.jpg",
    imageAlt:
      "Pharmaceutical professionals working in a modern laboratory environment",
  },
  {
    eyebrow: "Contract and Third Party Manufacturing",
    title: "Precision",
    accent: "Manufacturing",
    suffix: "at Scale",
    imageUrl: "/slide3.jpg",
    imageAlt:
      "Modern pharmaceutical manufacturing facility with production equipment",
  },
  {
    eyebrow: "Export Ready Pharmaceutical Supply",
    title: "Quality-Driven",
    accent: "Research",
    suffix: "for Better Care",
    imageUrl: "/slide2.jpg",
    imageAlt:
      "Pharmaceutical researcher working with a microscope in a clean laboratory",
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
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(13,17,23,0.64)_0%,rgba(13,17,23,0.38)_42%,rgba(13,17,23,0.08)_100%)]" />
              </div>

              <div className="relative z-10 flex h-full items-center">
                <div className="w-full max-w-3xl px-6 text-left sm:px-10 md:px-14 lg:pl-20">
                  {/* <p className="mb-4 text-xs font-bold uppercase text-primary-container sm:text-sm">
                    {slide.eyebrow}
                  </p> */}
                  <h1 className="max-w-xl text-4xl font-semibold text-white drop-shadow-[0_3px_16px_rgba(0,0,0,0.32)] sm:text-5xl md:text-6xl">
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
          <ChevronLeftIcon className="size-8" strokeWidth={2.5} />
        </button>
        <button
          type="button"
          aria-label="Show next hero slide"
          onClick={scrollNext}
          className="pointer-events-auto inline-flex h-12 w-12 items-center justify-center text-white/85 focus-visible:outline-none"
        >
          <ChevronRightIcon className="size-8" strokeWidth={2.5} />
        </button>
      </div>

      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
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

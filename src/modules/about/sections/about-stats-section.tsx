"use client"

import { useEffect, useRef, useState } from "react"
import { BadgeCheck, Factory, FlaskConical, Globe2 } from "lucide-react"
import type { LucideIcon } from "lucide-react"

type StatItem = {
  target: number
  suffix: "+" | "%"
  label: string
  icon: LucideIcon
}

const STAT_ITEMS: StatItem[] = [
  {
    target: 10,
    suffix: "+",
    label: "Years of Experience",
    icon: Factory,
  },
  {
    target: 500,
    suffix: "+",
    label: "Products",
    icon: FlaskConical,
  },
  {
    target: 25,
    suffix: "+",
    label: "Countries Served",
    icon: Globe2,
  },
  {
    target: 100,
    suffix: "%",
    label: "Quality Commitment",
    icon: BadgeCheck,
  },
]

export default function AboutStatsSection() {
  const sectionRef = useRef<HTMLDivElement | null>(null)
  const [shouldAnimate, setShouldAnimate] = useState(false)

  useEffect(() => {
    const element = sectionRef.current

    if (!element || shouldAnimate) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldAnimate(true)
          observer.disconnect()
        }
      },
      { threshold: 0.35 }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [shouldAnimate])

  return (
    <section className="bg-white py-16 lg:py-24">
      <div
        ref={sectionRef}
        className="content-container grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10"
      >
        {STAT_ITEMS.map((item) => {
          const Icon = item.icon

          return (
            <div key={item.label} className="text-center">
              <Icon
                aria-hidden="true"
                className="mx-auto mb-5 size-10 text-primary"
                strokeWidth={1.5}
              />
              <div className="apx-font-headline text-4xl font-semibold leading-none text-on-surface md:text-5xl">
                <AnimatedStatValue
                  target={item.target}
                  suffix={item.suffix}
                  start={shouldAnimate}
                />
              </div>
              <p className="mt-4 text-base font-medium text-on-surface-variant md:text-lg">
                {item.label}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function AnimatedStatValue({
  target,
  suffix,
  start,
}: {
  target: number
  suffix: StatItem["suffix"]
  start: boolean
}) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!start) {
      return
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    if (prefersReducedMotion) {
      setValue(target)
      return
    }

    let animationFrameId = 0
    const duration = 1200
    const startedAt = performance.now()

    const updateValue = (currentTime: number) => {
      const elapsed = currentTime - startedAt
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = 1 - Math.pow(1 - progress, 3)

      setValue(Math.round(target * easedProgress))

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateValue)
      }
    }

    animationFrameId = requestAnimationFrame(updateValue)

    return () => cancelAnimationFrame(animationFrameId)
  }, [start, target])

  return (
    <>
      {value}
      {suffix}
    </>
  )
}

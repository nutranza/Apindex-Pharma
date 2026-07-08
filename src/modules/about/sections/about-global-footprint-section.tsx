"use client"

import { useMemo, useState } from "react"
import Image from "next/image"

type MarketPoint = {
  id: string
  label: string
  markets: string
  description: string
  x: number
  y: number
  tone: "primary" | "secondary"
}

const MARKET_POINTS: MarketPoint[] = [
  {
    id: "india",
    label: "India",
    markets: "Manufacturing Base",
    description:
      "Integrated production planning, quality systems, and export documentation are coordinated from India.",
    x: 66.0,
    y: 53.8,
    tone: "primary",
  },
  {
    id: "africa",
    label: "Africa",
    markets: "Regional Healthcare Supply",
    description:
      "Reliable supply support for high-growth healthcare markets that need consistent batches and dependable records.",
    x: 56.1,
    y: 61.8,
    tone: "secondary",
  },
  {
    id: "southeast-asia",
    label: "Southeast Asia",
    markets: "Distributor Supply Support",
    description:
      "Responsive manufacturing alignment for distributors serving fast-moving regional demand.",
    x: 76.5,
    y: 42.5,
    tone: "secondary",
  },
  {
    id: "europe",
    label: "Europe",
    markets: "Regulated Market Readiness",
    description:
      "Structured export readiness and documentation discipline for tightly regulated procurement environments.",
    x: 54,
    y: 34.8,
    tone: "primary",
  },
  {
    id: "latin-america",
    label: "Latin America",
    markets: "Partner-Led Supply Programs",
    description:
      "Partner-focused supply planning for programs that require traceable quality and stable delivery cycles.",
    x: 25.2,
    y: 67,
    tone: "primary",
  },
]

export default function AboutGlobalFootprintSection() {
  const [activePointId, setActivePointId] = useState(MARKET_POINTS[0].id)

  const activePoint = useMemo(
    () =>
      MARKET_POINTS.find((point) => point.id === activePointId) ??
      MARKET_POINTS[0],
    [activePointId]
  )

  return (
    <section id="global-presence" className="bg-surface py-14 lg:py-20">
      <div className="content-container">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="section-heading">Global <span className="text-primary">Footprint</span></h2>
          <p className="mt-3 section-description">
            Connecting pharmaceutical partners with finished formulations,
            clear documentation, and export-ready supply support across global
            healthcare markets.
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl bg-white">
          <div className="relative aspect-[16/9] min-h-[300px] w-full overflow-hidden bg-surface-low sm:min-h-[420px] lg:min-h-[560px]">
            <Image
              fill
              priority={false}
              sizes="(min-width: 1280px) 1180px, 100vw"
              src="/global-footprint-map.png"
              alt="World map showing Apindex pharmaceutical export reach"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-white/10" />

            {MARKET_POINTS.map((point) => {
              const isActive = point.id === activePoint.id
              const markerColor =
                point.tone === "primary"
                  ? "bg-primary ring-primary/25"
                  : "bg-secondary ring-secondary/25"

              return (
                <button
                  key={point.id}
                  type="button"
                  aria-label={`Show ${point.label} market details`}
                  onClick={() => setActivePointId(point.id)}
                  onFocus={() => setActivePointId(point.id)}
                  onMouseEnter={() => setActivePointId(point.id)}
                  className="group absolute z-20 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full focus:outline-none"
                  style={{ left: `${point.x}%`, top: `${point.y}%` }}
                >
                  <span
                    className={`absolute h-8 w-8 rounded-full ${markerColor} opacity-45 ring-8 transition-transform duration-200 group-hover:scale-125 ${
                      isActive ? "scale-125" : "scale-100"
                    }`}
                  />
                  <span
                    className={`relative h-3.5 w-3.5 rounded-full ${markerColor} ring-4 transition-transform duration-200 ${
                      isActive ? "scale-125" : "scale-100"
                    }`}
                  />
                </button>
              )
            })}

            <div
              key={activePoint.id}
              className="absolute bottom-4 left-4 right-4 z-20 rounded-xl bg-white/95 p-4 shadow-[0_18px_45px_rgba(27,28,28,0.12)] backdrop-blur-sm animate-global-market-card sm:bottom-6 sm:left-auto sm:right-6 sm:w-[360px]"
            >
              <p className="text-sm font-bold text-primary">
                {activePoint.label}
              </p>
              <h3 className="apx-font-headline mt-1 text-xl font-extrabold text-on-surface">
                {activePoint.markets}
              </h3>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                {activePoint.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"

type MarketPoint = {
  code: string
  name: string
  x: number
  y: number
  flagY: number
  labelSide: "left" | "right"
  homeBase?: boolean
}

const MARKET_POINTS: MarketPoint[] = [
  {
    code: "ng",
    name: "Nigeria",
    x: 45.1,
    y: 63.5,
    flagY: 43,
    labelSide: "left",
  },
  {
    code: "ug",
    name: "Uganda",
    x: 51.6,
    y: 68.2,
    flagY: 14,
    labelSide: "right",
  },
  {
    code: "zm",
    name: "Zambia",
    x: 49.8,
    y: 76.5,
    flagY: 31,
    labelSide: "left",
  },
  {
    code: "tz",
    name: "Tanzania",
    x: 52.6,
    y: 72.4,
    flagY: 54,
    labelSide: "left",
  },
  {
    code: "somaliland",
    name: "Somaliland",
    x: 56.3,
    y: 63.8,
    flagY: 43,
    labelSide: "right",
  },
  {
    code: "jp",
    name: "Japan",
    x: 80.5,
    y: 53.5,
    flagY: 32,
    labelSide: "right",
  },
  {
    code: "in",
    name: "India",
    x: 65.1,
    y: 58.5,
    flagY: 24,
    labelSide: "right",
    homeBase: true,
  },
]

export default function AboutGlobalFootprintSection() {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const centerMap = () => {
      map.scrollLeft = (map.scrollWidth - map.clientWidth) / 2
    }

    centerMap()
    window.addEventListener("resize", centerMap)
    return () => window.removeEventListener("resize", centerMap)
  }, [])

  return (
    <section
      id="global-presence"
      aria-labelledby="global-footprint-heading"
      className="bg-surface apx-section-compact"
    >
      <div className="content-container">
        <div className="mx-auto max-w-3xl text-center">
          <h2 id="global-footprint-heading" className="section-heading">
            Global <span className="text-primary">Footprint</span>
          </h2>
          <p className="mt-3 section-description">
            Serving 5+ countries with dependable pharmaceutical supply and
            lasting healthcare partnerships, coordinated from India.
          </p>
        </div>
        <div className="mt-10 overflow-hidden">
          <p
            id="footprint-map-help"
            className="px-4 pt-4 text-xs text-on-surface-variant sm:hidden"
          >
            Swipe across the map to explore our locations.
          </p>
          <div
            ref={mapRef}
            role="region"
            aria-label="Apindex global footprint map"
            aria-describedby="footprint-map-help"
            tabIndex={0}
            className="overflow-x-auto overscroll-x-contain focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary"
          >
            <div className="relative aspect-[2/1] min-w-[900px]">
              <Image
                fill
                sizes="(min-width: 1280px) 1180px, (min-width: 900px) 100vw, 900px"
                src="/global-footprint-map-transparent.webp"
                alt="Tilted gray world map showing Apindex pharmaceutical export locations"
                className="object-contain opacity-50"
              />
              <svg
                aria-hidden="true"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="pointer-events-none absolute inset-0 h-full w-full"
                focusable="false"
              >
                {MARKET_POINTS.map((point) => (
                  <g key={point.code}>
                    <ellipse
                      cx={point.x}
                      cy={point.y}
                      rx="0.75"
                      ry="0.4"
                      fill="#30363a"
                      opacity="0.18"
                    />
                    <line
                      x1={point.x}
                      y1={point.y}
                      x2={point.x}
                      y2={point.flagY}
                      stroke="#42494d"
                      strokeWidth={1.8}
                      vectorEffect="non-scaling-stroke"
                    />
                  </g>
                ))}
              </svg>
              {MARKET_POINTS.map((point) => (
                <div
                  key={point.code}
                  role="img"
                  aria-label={`${point.name}, ${
                    point.homeBase ? "India home base" : "export market"
                  }`}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${point.x}%`, top: `${point.flagY}%` }}
                >
                  <div className="relative size-16 overflow-hidden rounded-full bg-white shadow-[0_4px_8px_rgba(0,0,0,0.18)] sm:size-[72px]">
                    <Image
                      src={`/assets/flags/${point.code}.svg`}
                      alt=""
                      fill
                      sizes="(min-width: 640px) 72px, 64px"
                      className={`object-cover ${
                        point.code === "zm" ? "object-right" : "object-center"
                      }`}
                    />
                  </div>
                  <div
                    aria-hidden="true"
                    className={`absolute top-1/2 w-max max-w-32 -translate-y-1/2 rounded bg-surface/95 px-1 ${
                      point.labelSide === "left"
                        ? "right-full mr-3 text-right"
                        : "left-full ml-3 text-left"
                    }`}
                  >
                    <p
                      className={`text-sm font-bold sm:text-base ${
                        point.homeBase ? "text-primary" : "text-on-surface"
                      }`}
                    >
                      {point.name}
                    </p>
                    {point.homeBase ? (
                      <p className="mt-0.5 text-[11px] font-medium text-on-surface-variant">
                        Home base
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

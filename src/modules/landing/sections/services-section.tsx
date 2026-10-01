import Image from "next/image"
import { PlayCircle } from "lucide-react"

const MANUFACTURING_VIDEO_URL: string | null = null

/*
const SERVICE_CARDS: ServiceCard[] = [
  ...service cards are temporarily hidden until the final service content is approved...
]
*/

export default function ServicesSection() {
  return (
    <section id="infrastructure" className="bg-surface apx-section-compact">
      <div className="content-container">
        <div className="mb-10 lg:mb-12">
          <h2 className="section-heading max-w-3xl">
            Manufacturing{" "}
            <span className="text-primary">Capabilities</span>
          </h2>
          <p className="section-description mt-4 max-w-2xl">
            End-to-end manufacturing support for pharmaceutical brands,
            institutions, and global healthcare partners, built around quality,
            scale, and reliable supply.
          </p>
        </div>

        <div className="mb-10 overflow-hidden rounded-2xl border border-outline-variant/20 bg-[#0d1117] shadow-[0_24px_60px_rgba(13,17,23,0.12)] lg:mb-12">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div className="relative aspect-video min-h-[240px] overflow-hidden lg:min-h-[360px]">
              {MANUFACTURING_VIDEO_URL ? (
                <video
                  className="absolute inset-0 h-full w-full object-cover"
                  controls
                  playsInline
                  preload="metadata"
                  poster="/about-company.jpg"
                >
                  <source src={MANUFACTURING_VIDEO_URL} type="video/mp4" />
                  Your browser does not support embedded video.
                </video>
              ) : (
                <>
                  <Image
                    fill
                    sizes="(min-width: 1024px) 58vw, 100vw"
                    src="/about-company.jpg"
                    alt="Apindex pharmaceutical manufacturing facility placeholder"
                    className="object-cover opacity-65"
                  />
                  <div className="absolute inset-0 bg-[#0d1117]/50" />
                  <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center text-white">
                    <PlayCircle aria-hidden="true" className="size-14 text-primary-container" strokeWidth={1.4} />
                    <p className="mt-4 text-lg font-bold">Manufacturing video coming soon</p>
                    <p className="mt-2 max-w-sm text-sm leading-6 text-white/70">
                      This space is ready for a facility, production, or quality
                      process video when the final media is available.
                    </p>
                  </div>
                </>
              )}
            </div>
            <div className="p-6 text-white sm:p-8 lg:p-10">
              <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-primary-container">
                Inside Apindex
              </p>
              <h3 className="mt-3 apx-font-headline text-2xl font-extrabold sm:text-3xl">
                Built around quality, coordination, and dependable supply.
              </h3>
              <p className="mt-4 text-sm leading-7 text-white/70 sm:text-base">
                The future video will introduce partners to our manufacturing
                support approach, documentation discipline, and product
                coordination process.
              </p>
            </div>
          </div>
        </div>

        {/*
          Temporary: service cards are hidden while the service content is
          being finalized. Restore this grid when the cards are approved.
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {SERVICE_CARDS.map((card, index) => {
            const Icon = card.icon
            return (
              <div
                key={card.title}
                className="flex min-h-[250px] flex-col rounded-xl bg-white p-6"
              >
                <div className="mb-7 flex items-start justify-between gap-4">
                  <Icon aria-hidden="true" className="text-4xl text-primary" strokeWidth={1.8} />
                  <span className="text-sm font-bold text-on-surface-variant/50">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="apx-font-headline text-xl font-semibold leading-tight text-on-surface">
                  {card.title}
                </h3>
                <p className="mt-4 text-sm leading-6 text-on-surface-variant">
                  {card.description}
                </p>
              </div>
            )
          })}
        </div>
        */}
      </div>
    </section>
  )
}

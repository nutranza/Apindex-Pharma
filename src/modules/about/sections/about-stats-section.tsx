import { GLOBAL_STATS } from "@/modules/company/constants"
import AboutPurposeSection from "@modules/about/sections/about-purpose-section"

const STAT_COPY: Record<string, { badge: string; description: string }> = {
  "Countries Served": {
    badge: "Global reach",
    description: "Domestic and global supply",
  },
  "Global Clients": {
    badge: "Clientele",
    description: "Healthcare partnerships",
  },
  Products: {
    badge: "Product range",
    description: "Diverse dosage forms",
  },
  "Years of Expertise": {
    badge: "Experience",
    description: "Pharmaceutical supply expertise",
  },
}

export default function AboutStatsSection() {
  return (
    <section
      aria-labelledby="about-stats-heading"
      className="bg-[#f5f9ef] apx-section"
    >
      <div className="content-container">
        <AboutPurposeSection />

        <div className="mt-12 lg:mt-16">
          <h2 id="about-stats-heading" className="section-heading col-span-full mb-4 lg:mb-6">
            Trusted worldwide.{" "}
            <span className="text-secondary">Committed to quality.</span>
          </h2>
          <div className=" grid grid-cols-1 sm:grid-cols-2 gap-4 lg:grid-cols-4">
            {GLOBAL_STATS.map((stat) => {
              const copy = STAT_COPY[stat.label]
              const hasPlus = stat.value.endsWith("+")
              const value = hasPlus ? stat.value.slice(0, -1) : stat.value

              return (
                <article
                  key={stat.label}
                  className="flex min-w-0 flex-col items-center rounded-2xl border border-secondary/25 bg-white px-4 py-6 text-center sm:p-7"
                >
                  <p className="rounded-full bg-secondary/10 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.12em] text-on-secondary-container sm:text-[10px]">
                    {copy?.badge ?? stat.label}
                  </p>
                  <p className="apx-font-headline mt-5 text-3xl font-bold leading-none tracking-tight text-on-surface/75 tabular-nums sm:text-5xl xl:text-6xl">
                    {value}
                    {hasPlus ? (
                      <span className="text-xl text-secondary sm:text-2xl xl:text-3xl">
                        +
                      </span>
                    ) : null}
                  </p>
                  <h3 className="mt-4 flex min-h-10 items-center justify-center text-[10px] font-semibold uppercase leading-5 tracking-[0.06em] text-on-surface-variant sm:min-h-0 sm:text-xs">
                    {stat.label}
                  </h3>
                  <p className="mt-1 flex-1 text-xs leading-5 text-on-surface-variant/80">
                    {copy?.description}
                  </p>
                  <span
                    aria-hidden="true"
                    className="mt-4 h-px w-7 bg-secondary/60"
                  />
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

import { BadgeCheck, FlaskConical, Globe2, UsersRound } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { GLOBAL_STATS } from "@/modules/company/constants"

const STAT_ICONS: Record<string, LucideIcon> = {
  "Countries Served": Globe2,
  "Global Clients": UsersRound,
  "Sterile Products": FlaskConical,
  "Non-Sterile Products": BadgeCheck,
}

export default function AboutStatsSection() {
  return (
    <section className="bg-white apx-section">
      <div className="content-container grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
        {GLOBAL_STATS.map((stat) => {
          const Icon = STAT_ICONS[stat.label] ?? BadgeCheck

          return (
            <div key={stat.label} className="text-center">
              <Icon
                aria-hidden="true"
                className="mx-auto mb-5 size-10 text-primary"
                strokeWidth={1.5}
              />
              <div className="apx-font-headline text-4xl font-semibold leading-none text-on-surface md:text-5xl">
                {stat.value}
              </div>
              <p className="mt-4 text-base font-medium text-on-surface-variant md:text-lg">
                {stat.label}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

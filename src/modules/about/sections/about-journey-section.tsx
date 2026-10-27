import { ChevronDown, Globe2, PackageCheck, Sprout, Truck } from "lucide-react"
import type { LucideIcon } from "lucide-react"

type JourneyMilestone = {
  date: string
  dateTime?: string
  title: string
  description: string
  icon: LucideIcon
  position: string
}

const JOURNEY_MILESTONES: JourneyMilestone[] = [
  {
    date: "Nov 2021",
    dateTime: "2021-11",
    title: "Founded in India",
    description: "A clear purpose: quality healthcare products at affordable prices.",
    icon: Sprout,
    position: "md:self-start",
  },
  {
    date: "Apr 2023",
    dateTime: "2023-04",
    title: "Going global",
    description: "We expanded beyond India into international pharmaceutical markets.",
    icon: Globe2,
    position: "md:-mt-20 md:self-end",
  },
  {
    date: "May 2024",
    dateTime: "2024-05",
    title: "First export orders",
    description: "Nigeria became the destination for our first international orders.",
    icon: PackageCheck,
    position: "md:ml-[8%] md:mt-4 md:self-start",
  },
  {
    date: "Today",
    title: "Growing our reach",
    description: "Delivering to Zambia, Uganda, Somaliland and Tanzania.",
    icon: Truck,
    position: "md:-mt-20 md:self-end",
  },
]

export default function AboutJourneySection() {
  return (
    <section aria-labelledby="journey-heading" className="apx-section bg-white">
      <div className="content-container">
        <div className="text-center">
          <h2 id="journey-heading" className="section-heading">
            Our <span className="text-primary">Journey</span>
          </h2>
          <p className="mt-5 text-base leading-7 text-on-surface-variant">
            Growing through consistent effort, with accessible healthcare at
            the heart of every step.
          </p>
        </div>

        <div className="relative mt-12 lg:mt-14">
          <ol className="relative flex flex-col gap-6 md:gap-0">
            {JOURNEY_MILESTONES.map((milestone, index) => {
              const Icon = milestone.icon
              const highlighted = index === 0 || index === 3

              return (
                <li
                  key={milestone.date}
                  className={`relative w-full sm:w-4/5 sm:self-center md:w-[42%] ${milestone.position}`}
                >
                  <article
                    className={`relative flex min-h-[176px] gap-4 rounded-3xl p-3 pr-5 sm:gap-5 sm:pr-7 md:min-h-[192px] md:gap-3 md:pr-4 lg:gap-5 lg:pr-7 ${highlighted ? "bg-primary-fixed" : "bg-neutral-50"}`}
                  >
                    <div
                      className={`flex w-8 shrink-0 items-center justify-center rounded-full py-4 text-xs font-medium md:w-7 lg:w-8 ${highlighted ? "bg-primary text-on-surface" : "bg-on-surface text-white"}`}
                    >
                      <span className="rotate-180 whitespace-nowrap [writing-mode:vertical-rl]">
                        {milestone.dateTime ? (
                          <time dateTime={milestone.dateTime}>{milestone.date}</time>
                        ) : (
                          milestone.date
                        )}
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-between gap-6 py-3">
                      <div className="flex items-center gap-3">
                        <Icon
                          aria-hidden="true"
                          className="size-5 shrink-0 text-foreground"
                          strokeWidth={1.6}
                        />
                        <h3 className="apx-font-headline text-lg font-medium leading-snug text-on-surface sm:text-xl md:text-base lg:text-xl">
                          <span className="mr-1.5">{index + 1}</span>
                          {milestone.title}
                        </h3>
                      </div>
                      <p className="text-sm leading-6 text-on-surface-variant sm:text-base md:text-sm lg:text-base">
                        {milestone.description}
                      </p>
                    </div>
                  </article>
                  {index < JOURNEY_MILESTONES.length - 1 ? (
                    <>
                      <span
                        aria-hidden="true"
                        className="absolute left-7 top-full h-6 border-l border-dashed border-primary/50 md:hidden"
                      />
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none absolute hidden border-t border-dashed border-primary/50 md:block ${index === 1 ? "right-full top-[70%] h-[calc(30%+1rem)] w-[69%] rounded-tl-2xl border-l" : `left-full top-[40%] h-[calc(60%-5rem)] rounded-tr-2xl border-r ${index === 0 ? "w-[88%]" : "w-[69%]"}`}`}
                      >
                        <ChevronDown
                          className={`absolute -bottom-1 size-3 text-primary/70 ${index === 1 ? "-left-1.5" : "-right-1.5"}`}
                        />
                      </span>
                    </>
                  ) : null}
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}

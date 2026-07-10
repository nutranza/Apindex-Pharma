import Link from "next/link"

import LegalPageNav, {
  type LegalNavItem,
} from "@modules/legal/components/legal-page-nav"

type LegalSection = {
  title: string
  paragraphs?: string[]
  bullets?: string[]
}

type LegalPageTemplateProps = {
  eyebrow: string
  title: string
  description: string
  lastUpdated: string
  summaryItems?: string[]
  sections: LegalSection[]
}

function buildSectionId(title: string) {
  return title
    .toLowerCase()
    .replace(/^\d+\.\s*/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export default function LegalPageTemplate({
  eyebrow,
  title,
  description,
  lastUpdated,
  summaryItems = [],
  sections,
}: LegalPageTemplateProps) {
  const navItems: LegalNavItem[] = sections.map((section) => ({
    id: buildSectionId(section.title),
    title: section.title.replace(/^\d+\.\s*/, ""),
  }))

  return (
    <div className="apx-landing apx-font-body bg-surface text-on-surface">
      <main>
        <section className="border-b border-outline-variant/10 bg-white py-10 lg:py-14">
          <div className="content-container mt-14 lg:mt-16">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
              <div className="max-w-3xl">
                <p className="mb-3 text-sm font-extrabold uppercase tracking-[0.14em] text-primary">
                  {eyebrow}
                </p>
                <h1 className="section-heading">{title}</h1>
                <p className="mt-5 section-description">{description}</p>
                <div className="mt-4 text-on-surface-variant">
                  <p className="font-semibold">Last Updated:</p>
                  <p>{lastUpdated}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-surface py-10 lg:py-14">
          <div className="content-container">
            {summaryItems.length ? (
              <div className="mb-8 grid gap-4 md:grid-cols-3">
                {summaryItems.map((item) => (
                  <div
                    key={item}
                    className="rounded-xl border border-outline-variant/15 bg-white p-5"
                  >
                    <p className="text-sm font-semibold leading-6 text-on-surface-variant">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
              <aside className="hidden lg:block">
                <LegalPageNav items={navItems} />
              </aside>

              <div className="rounded-xl border border-outline-variant/15 bg-white">
                {sections.map((section, index) => (
                  <article
                    key={section.title}
                    id={navItems[index].id}
                    className="scroll-mt-28 border-b border-outline-variant/10 p-6 last:border-b-0 sm:p-8"
                  >
                    <h2 className="apx-font-headline text-lg font-extrabold text-on-surface sm:text-xl">
                      {section.title}
                    </h2>

                    {section.paragraphs?.length ? (
                      <div className="mt-4 space-y-4">
                        {section.paragraphs.map((paragraph) => (
                          <p
                            key={paragraph}
                            className="text-sm leading-7 text-on-surface-variant sm:text-base"
                          >
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    ) : null}

                    {section.bullets?.length ? (
                      <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-7 text-on-surface-variant sm:text-base">
                        {section.bullets.map((bullet) => (
                          <li key={bullet}>{bullet}</li>
                        ))}
                      </ul>
                    ) : null}
                  </article>
                ))}

                <div className="border-t border-outline-variant/10 bg-surface-low p-6 text-sm leading-7 text-on-surface-variant sm:p-8">
                  <p className="font-semibold text-on-surface">
                    For privacy, compliance, or website content questions:
                  </p>
                  <p className="mt-2">
                    Email{" "}
                    <a
                      href="mailto:info@apindexpharma.com"
                      className="font-semibold text-primary transition-colors hover:text-primary-container"
                    >
                      info@apindexpharma.com
                    </a>{" "}
                    or visit the{" "}
                    <Link
                      href="/contact"
                      className="font-semibold text-primary transition-colors hover:text-primary-container"
                    >
                      Contact page
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

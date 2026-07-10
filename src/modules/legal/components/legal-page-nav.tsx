"use client"

import { MouseEvent, useEffect, useState } from "react"

export type LegalNavItem = {
  id: string
  title: string
}

type LegalPageNavProps = {
  items: LegalNavItem[]
}

export default function LegalPageNav({ items }: LegalPageNavProps) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "")

  useEffect(() => {
    const hashId = window.location.hash.replace("#", "")

    if (hashId && items.some((item) => item.id === hashId)) {
      setActiveId(hashId)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

        if (visibleEntry?.target.id) {
          setActiveId(visibleEntry.target.id)
        }
      },
      {
        rootMargin: "-120px 0px -55% 0px",
        threshold: [0.12, 0.3, 0.6],
      }
    )

    items.forEach((item) => {
      const target = document.getElementById(item.id)

      if (target) {
        observer.observe(target)
      }
    })

    return () => {
      observer.disconnect()
    }
  }, [items])

  function handleClick(
    event: MouseEvent<HTMLAnchorElement>,
    item: LegalNavItem
  ) {
    const target = document.getElementById(item.id)

    if (!target) {
      return
    }

    event.preventDefault()
    setActiveId(item.id)
    window.history.pushState(null, "", `#${item.id}`)
    target.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <nav className="sticky top-28 rounded-xl border border-outline-variant/15 bg-white p-5">
      <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary">
        On this page
      </p>
      <ol className="mt-4 space-y-2 text-sm text-on-surface-variant">
        {items.map((item, index) => {
          const isActive = item.id === activeId

          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={isActive ? "true" : undefined}
                onClick={(event) => handleClick(event, item)}
                className={`group flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors ${
                  isActive
                    ? "bg-primary-fixed text-on-surface"
                    : "hover:bg-surface-low hover:text-primary"
                }`}
              >
                <span
                  className={`flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold transition-colors ${
                    isActive
                      ? "bg-primary text-white"
                      : "bg-primary-fixed text-primary group-hover:bg-primary group-hover:text-white"
                  }`}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className={isActive ? "font-semibold" : undefined}>
                  {item.title}
                </span>
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

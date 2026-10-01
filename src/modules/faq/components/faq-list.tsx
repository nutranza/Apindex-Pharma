"use client"

import { Plus } from "lucide-react"
import { useState } from "react"

import { FAQ_ITEMS } from "@modules/faq/constants"

export default function FaqList() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="space-y-3">
      {FAQ_ITEMS.map((item, index) => {
        const isOpen = openIndex === index
        const panelId = `faq-panel-${index + 1}`

        return (
          <article
            key={item.question}
            className="apx-card overflow-hidden transition-colors hover:border-secondary/35"
          >
            <h2>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left text-base font-semibold text-on-surface transition-colors hover:bg-secondary-fixed/25 sm:px-6 sm:py-6 sm:text-lg"
              >
                <span>{item.question}</span>
                <Plus
                  aria-hidden="true"
                  className={`size-5 shrink-0 text-secondary transition-transform ${
                    isOpen ? "rotate-45" : ""
                  }`}
                />
              </button>
            </h2>
            {isOpen ? (
              <div
                id={panelId}
                role="region"
                className="border-t border-outline-variant/15 px-5 pb-6 pt-4 text-sm leading-7 text-on-surface-variant sm:px-6"
              >
                {item.answer}
              </div>
            ) : null}
          </article>
        )
      })}
    </div>
  )
}

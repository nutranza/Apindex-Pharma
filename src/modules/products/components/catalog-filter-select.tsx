"use client"

import { Listbox, Transition } from "@headlessui/react"
import { Check, ChevronDown } from "lucide-react"
import { Fragment } from "react"
import { useMemo, useState } from "react"

import { cn } from "@/lib/util/cn"

export type CatalogFilterOption = {
  label: string
  value: string
}

type CatalogFilterSelectProps = {
  id: string
  label: string
  value: string
  options: readonly CatalogFilterOption[]
  onChange: (_value: string) => void
  searchable?: boolean
  searchPlaceholder?: string
}

export default function CatalogFilterSelect({
  id,
  label,
  value,
  options,
  onChange,
  searchable = false,
  searchPlaceholder = "Search options",
}: CatalogFilterSelectProps) {
  const [optionSearchQuery, setOptionSearchQuery] = useState("")
  const selectedOption =
    options.find((option) => option.value === value) ?? options[0]
  const visibleOptions = useMemo(() => {
    const normalizedQuery = optionSearchQuery.trim().toLowerCase()

    if (!searchable || !normalizedQuery) {
      return options
    }

    return options.filter(
      (option) =>
        option.value === "" || option.label.toLowerCase().includes(normalizedQuery)
    )
  }, [optionSearchQuery, options, searchable])

  function handleOptionChange(nextValue: string) {
    setOptionSearchQuery("")
    onChange(nextValue)
  }

  return (
    <Listbox value={value} onChange={handleOptionChange}>
      <div className="relative">
        <label
          htmlFor={id}
          className="apx-eyebrow text-on-surface-variant"
        >
          {label}
        </label>
        <Listbox.Button
          id={id}
          aria-label={`${label}: ${selectedOption?.label}`}
          onClick={() => setOptionSearchQuery("")}
          className="apx-select-trigger mt-3"
        >
          <span className="truncate">{selectedOption?.label}</span>
          <ChevronDown aria-hidden="true" className="size-4 shrink-0 text-primary" />
        </Listbox.Button>

        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute left-0 right-0 z-40 mt-2 overflow-hidden rounded-xl border border-outline-variant/30 bg-white shadow-[0_18px_40px_rgba(31,65,21,0.16)] outline-none focus:outline-none">
            {searchable ? (
              <div className="border-b border-outline-variant/20 bg-white p-2">
                <label htmlFor={`${id}-search`} className="sr-only">
                  Search {label.toLowerCase()}
                </label>
                <input
                  id={`${id}-search`}
                  type="search"
                  value={optionSearchQuery}
                  onChange={(event) => setOptionSearchQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key !== "Escape") {
                      event.stopPropagation()
                    }
                  }}
                  placeholder={searchPlaceholder}
                  className="h-10 w-full rounded-lg border border-outline-variant/35 bg-surface px-3 text-sm font-medium text-on-surface outline-none placeholder:text-on-surface-variant/65 focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
              </div>
            ) : null}

            <div className="max-h-64 overflow-y-auto p-1">
              {visibleOptions.map((option) => (
                <Listbox.Option
                  key={option.value}
                  value={option.value}
                  className={({ active }) =>
                    cn(
                      "flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                      active
                        ? "bg-primary-fixed/65 text-on-surface"
                        : "text-on-surface-variant"
                    )
                  }
                >
                  {({ selected }) => (
                    <>
                      <span className={cn(selected && "font-bold text-on-surface")}>
                        {option.label}
                      </span>
                      {selected ? (
                        <Check aria-hidden="true" className="size-4 shrink-0 text-secondary" />
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}

              {visibleOptions.length === 0 ? (
                <p className="px-3 py-3 text-sm text-on-surface-variant">
                  No {label.toLowerCase()} found
                </p>
              ) : null}
            </div>
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  )
}

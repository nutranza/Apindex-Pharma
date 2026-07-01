"use client"

import { useEffect, useRef, useState } from "react"
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

type NavItem = {
  label: string
  href: string
}

const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  // { label: "Company", href: "/company" },
  { label: "About", href: "/about" },
  { label: "Products", href: "/products" },
  { label: "Gallery", href: "/gallery" },
  // { label: "Global Presence", href: "/Global-Presence" },
  { label: "Contact", href: "/contact" },

]

function normalizePathname(pathname: string) {
  if (pathname === "/") {
    return pathname
  }

  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname
}

export default function TopNavBar() {
  const pathname = normalizePathname(usePathname() ?? "/")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const scrollPositionRef = useRef(0)

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return
    }

    const { body, documentElement } = document
    const previousBodyPosition = body.style.position
    const previousBodyTop = body.style.top
    const previousBodyLeft = body.style.left
    const previousBodyRight = body.style.right
    const previousBodyWidth = body.style.width
    const previousBodyOverflow = body.style.overflow
    const previousHtmlOverflow = documentElement.style.overflow

    scrollPositionRef.current = window.scrollY
    body.classList.add("modal-open")
    documentElement.style.overflow = "hidden"
    body.style.overflow = "hidden"
    body.style.position = "fixed"
    body.style.top = `-${scrollPositionRef.current}px`
    body.style.left = "0"
    body.style.right = "0"
    body.style.width = "100%"

    return () => {
      body.classList.remove("modal-open")
      documentElement.style.overflow = previousHtmlOverflow
      body.style.position = previousBodyPosition
      body.style.top = previousBodyTop
      body.style.left = previousBodyLeft
      body.style.right = previousBodyRight
      body.style.width = previousBodyWidth
      body.style.overflow = previousBodyOverflow
      window.scrollTo(0, scrollPositionRef.current)
    }
  }, [isMobileMenuOpen])

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-gray-200/60 shadow-sm bg-white">
      <div className="content-container">
        <div className="flex h-20 w-full items-center justify-between">
          <Link href="/" aria-label="Apindex home" className="shrink-0">
            <Image
              src="/apindex-logo.jpg"
              alt="Apindex"
              width={1920}
              height={1187}
              priority
              quality={100}
              className="h-14 w-auto object-contain sm:h-16"
            />
          </Link>

          <div className="hidden flex-1 items-center justify-end gap-10 small:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="group apx-font-headline inline-flex items-center py-2 text-sm font-medium uppercase text-on-surface focus-visible:outline-none lg:text-base"
              >
                <span className="relative inline-block after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:rounded-full after:bg-primary after:content-[''] after:transition-[width] after:duration-300 after:ease-out group-hover:after:w-full group-focus-visible:after:w-full">
                  {item.label}
                </span>
              </Link>
            ))}
          </div>

          <button
            type="button"
            aria-expanded={isMobileMenuOpen}
            aria-controls="apindex-mobile-navigation"
            aria-label={
              isMobileMenuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            onClick={() => setIsMobileMenuOpen((currentValue) => !currentValue)}
            className="inline-flex h-11 w-11 items-center justify-center text-on-surface transition-colors hover:text-primary focus-visible:outline-none small:hidden"
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {isMobileMenuOpen ? (
        <div className="fixed inset-0 z-50 small:hidden">
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute inset-0 bg-black/35"
          />

          <div
            id="apindex-mobile-navigation"
            className="absolute left-0 top-0 flex h-full w-[min(80vw,360px)] animate-fade-in-left flex-col bg-white shadow-[18px_0_36px_rgba(86,67,54,0.16)]"
          >
            <div className="flex h-20 items-center justify-between border-b border-gray-200/80 px-6">
              <Image
                src="/apindex-logo.jpg"
                alt="Apindex"
                width={1920}
                height={1187}
                quality={100}
                className="h-14 w-auto object-contain"
              />
              <button
                type="button"
                aria-label="Close navigation menu"
                onClick={() => setIsMobileMenuOpen(false)}
                className="inline-flex h-11 w-11 items-center justify-center text-on-surface transition-colors hover:text-primary focus-visible:outline-none"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="flex flex-col gap-1 px-5 py-6">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="group apx-font-headline rounded-lg px-4 py-3 text-base font-bold uppercase text-on-surface focus-visible:outline-none"
                >
                  <span className="relative inline-block after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:rounded-full after:bg-primary after:content-[''] after:transition-[width] after:duration-300 after:ease-out group-hover:after:w-full group-focus-visible:after:w-full">
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </nav>
  )
}

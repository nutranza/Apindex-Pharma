"use client"

import { useEffect, useState } from "react"
import { ChevronUp } from "lucide-react"

const HERO_EXIT_RATIO = 0.45

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    let ticking = false

    function updateVisibility() {
      const heroAwareOffset = window.innerHeight * HERO_EXIT_RATIO

      setIsVisible(window.scrollY > heroAwareOffset)
      ticking = false
    }

    function handleScroll() {
      if (ticking) {
        return
      }

      ticking = true
      window.requestAnimationFrame(updateVisibility)
    }

    updateVisibility()
    window.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("resize", handleScroll)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", handleScroll)
    }
  }, [])

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className={`fixed bottom-7 right-7 z-50 flex size-10 rounded-full items-center justify-center bg-secondary text-white shadow-[0_14px_28px_rgba(107,173,35,0.28)] transition-all duration-300 hover:bg-on-secondary-container focus:outline-none focus-visible:ring-4 focus-visible:ring-secondary-container md:bottom-8 md:right-8 ${
        isVisible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-6 opacity-0"
      }`}
    >
      <ChevronUp aria-hidden="true" className="size-6" strokeWidth={3} />
    </button>
  )
}

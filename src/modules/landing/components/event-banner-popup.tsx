"use client"

import { useEffect, useRef, useState } from "react"
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  Transition,
} from "@headlessui/react"
import { XMarkIcon } from "@heroicons/react/24/outline"
import {
  EventBannerResponseSchema,
  type PublicEventBanner,
} from "@/lib/types/event-banner"

export default function EventBannerPopup() {
  const [banner, setBanner] = useState<PublicEventBanner | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const closeButton = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    let controller = new AbortController()
    let cancelled = false
    let image: HTMLImageElement | null = null

    async function loadBanner() {
      controller.abort()
      controller = new AbortController()
      const requestController = controller
      if (image) {
        image.onload = null
        image.onerror = null
      }
      try {
        const response = await fetch("/api/event-banner", {
          cache: "no-store",
          signal: requestController.signal,
        })
        if (!response.ok) return
        const payload: unknown = await response.json()
        const parsed = EventBannerResponseSchema.safeParse(payload)
        if (
          !parsed.success ||
          !parsed.data.banner ||
          cancelled ||
          requestController.signal.aborted
        )
          return
        const current = parsed.data.banner
        image = new window.Image()
        image.onload = () => {
          if (cancelled || requestController.signal.aborted) return
          setBanner(current)
          setIsOpen(true)
        }
        image.onerror = () => {
          /* Keep the homepage usable if the image fails. */
        }
        image.src = current.image_url
      } catch {
        // The event is optional; network failures must not block the homepage.
      }
    }
    function handleHomeActivated() {
      void loadBanner()
    }
    window.addEventListener("apindex:home-activated", handleHomeActivated)
    void loadBanner()
    return () => {
      cancelled = true
      window.removeEventListener("apindex:home-activated", handleHomeActivated)
      controller.abort()
      if (image) {
        image.onload = null
        image.onerror = null
      }
    }
  }, [])

  function close() {
    setIsOpen(false)
  }

  if (!banner) return null

  return (
    <Transition appear show={isOpen}>
      <Dialog
        onClose={close}
        initialFocus={closeButton}
        className="fixed inset-0 z-[200]"
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-black/60 transition-opacity duration-300 ease-out data-[closed]:opacity-0 data-[leave]:duration-200 data-[leave]:ease-in motion-reduce:transition-none"
        />
        <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6">
          <DialogPanel
            transition
            data-testid="event-banner-panel"
            className="relative w-fit max-w-4xl rounded-xl bg-white p-2 shadow-2xl transition duration-300 ease-out data-[closed]:scale-95 data-[closed]:opacity-0 data-[leave]:duration-200 data-[leave]:ease-in motion-reduce:transform-none motion-reduce:transition-none"
          >
            <DialogTitle className="sr-only">{banner.name}</DialogTitle>
            <button
              ref={closeButton}
              type="button"
              onClick={close}
              aria-label="Close event banner"
              className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-900 shadow-md hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            <img
              src={banner.image_url}
              alt={banner.name}
              onError={() => setIsOpen(false)}
              className="block max-h-[85dvh] w-auto max-w-full rounded-lg object-contain"
            />
          </DialogPanel>
        </div>
      </Dialog>
    </Transition>
  )
}

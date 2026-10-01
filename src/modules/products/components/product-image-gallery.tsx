"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { GiMedicines } from "react-icons/gi"

type ProductImageGalleryProps = {
  productName: string
  images: string[]
}

export default function ProductImageGallery({
  productName,
  images,
}: ProductImageGalleryProps) {
  const galleryImages = useMemo(
    () =>
      Array.from(
        new Set(images.map((image) => image.trim()).filter(Boolean))
      ),
    [images]
  )
  const [selectedImage, setSelectedImage] = useState<string | null>(
    galleryImages[0] ?? null
  )

  useEffect(() => {
    if (!galleryImages.length) {
      setSelectedImage(null)
      return
    }

    if (!selectedImage || !galleryImages.includes(selectedImage)) {
      setSelectedImage(galleryImages[0])
    }
  }, [galleryImages, selectedImage])

  const selectedIndex = selectedImage ? galleryImages.indexOf(selectedImage) : -1
  const hasMultipleImages = galleryImages.length > 1

  function showPreviousImage() {
    if (!hasMultipleImages) {
      return
    }

    const currentIndex = selectedIndex >= 0 ? selectedIndex : 0
    const previousIndex =
      currentIndex === 0 ? galleryImages.length - 1 : currentIndex - 1
    setSelectedImage(galleryImages[previousIndex])
  }

  function showNextImage() {
    if (!hasMultipleImages) {
      return
    }

    const currentIndex = selectedIndex >= 0 ? selectedIndex : 0
    const nextIndex =
      currentIndex === galleryImages.length - 1 ? 0 : currentIndex + 1
    setSelectedImage(galleryImages[nextIndex])
  }

  return (
    <div className="min-w-0">
      <div className="group relative flex min-h-[360px] items-center justify-center overflow-hidden rounded-3xl border border-outline-variant/25 bg-surface-lowest p-4 shadow-[0_18px_45px_rgba(86,67,54,0.08)] sm:min-h-[500px] sm:p-7">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-8 rounded-[2rem] border border-white/80"
        />
        {selectedImage ? (
          <div className="relative z-10 h-full min-h-[320px] w-full rounded-2xl bg-white/80">
            <Image
              src={selectedImage}
              alt={`${productName} packaging`}
              fill
              unoptimized
              sizes="(min-width: 1024px) 38vw, 100vw"
              className="object-contain"
              priority
            />
          </div>
        ) : (
          <div className="flex h-full min-h-[260px] w-full items-center justify-center text-primary">
            <GiMedicines className="text-7xl" />
          </div>
        )}

        {hasMultipleImages ? (
          <>
            <button
              type="button"
              onClick={showPreviousImage}
              className="absolute left-6 top-1/2 z-20 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-secondary text-white opacity-0 shadow-lg transition-all hover:-translate-x-0.5 hover:bg-on-secondary-container focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary group-hover:opacity-100"
              aria-label={`Show previous ${productName} image`}
            >
              <ChevronLeft className="size-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={showNextImage}
              className="absolute right-6 top-1/2 z-20 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-secondary text-white opacity-0 shadow-lg transition-all hover:translate-x-0.5 hover:bg-on-secondary-container focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary group-hover:opacity-100"
              aria-label={`Show next ${productName} image`}
            >
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
          </>
        ) : null}
      </div>

      {hasMultipleImages ? (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {galleryImages.map((image, index) => {
            const isSelected = image === selectedImage

            return (
              <button
                key={image}
                type="button"
                onClick={() => setSelectedImage(image)}
                className={`relative h-24 w-full overflow-hidden rounded-2xl border bg-white p-2 transition-all hover:-translate-y-0.5 hover:border-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary ${
                  isSelected
                    ? "border-secondary shadow-[0_0_0_3px_rgba(107,173,35,0.16)]"
                    : "border-outline-variant/30"
                }`}
                aria-label={`Show ${productName} image ${index + 1}`}
              >
                <Image
                  src={image}
                  alt={`${productName} thumbnail ${index + 1}`}
                  fill
                  unoptimized
                  sizes="96px"
                  className="object-contain p-2"
                />
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

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
    <div>
      <div className="group relative flex min-h-[320px] items-center justify-center border border-gray-200 bg-white p-6 sm:min-h-[380px]">
        {selectedImage ? (
          <div className="relative h-full min-h-[260px] w-full">
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
              className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center bg-black/70 text-white opacity-0 transition-opacity hover:bg-black focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary group-hover:opacity-100"
              aria-label={`Show previous ${productName} image`}
            >
              <ChevronLeft className="h-6 w-6" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={showNextImage}
              className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center bg-black/70 text-white opacity-0 transition-opacity hover:bg-black focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary group-hover:opacity-100"
              aria-label={`Show next ${productName} image`}
            >
              <ChevronRight className="h-6 w-6" aria-hidden="true" />
            </button>
          </>
        ) : null}
      </div>

      {hasMultipleImages ? (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:flex sm:flex-wrap">
          {galleryImages.map((image, index) => {
            const isSelected = image === selectedImage

            return (
              <button
                key={image}
                type="button"
                onClick={() => setSelectedImage(image)}
                className={`relative h-20 w-full border bg-white p-2 transition-colors hover:border-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary sm:w-24 ${
                  isSelected ? "border-secondary" : "border-gray-200"
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

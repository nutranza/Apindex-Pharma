"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { FaChevronLeft, FaChevronRight, FaTimes } from "react-icons/fa"
import { MdOutlineScience } from "react-icons/md"

import type { PublicCatalogResult } from "@/lib/data/public-catalog"
import {
  getProductBadge,
  getProductIcon,
} from "@/modules/products/lib/catalog-ui"

type GalleryPageTemplateProps = {
  catalog: PublicCatalogResult
}

export default function GalleryPageTemplate({
  catalog,
}: GalleryPageTemplateProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const displayProducts = catalog.products

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedIndex((prev) =>
      prev !== null
        ? (prev - 1 + displayProducts.length) % displayProducts.length
        : null
    )
  }

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedIndex((prev) =>
      prev !== null ? (prev + 1) % displayProducts.length : null
    )
  }

  const handleClose = () => setSelectedIndex(null)

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (selectedIndex === null) {
      document.body.classList.remove("modal-open")
      return
    }

    document.body.classList.add("modal-open")

    const count = displayProducts.length
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedIndex(null)
      } else if (e.key === "ArrowLeft") {
        setSelectedIndex((prev) =>
          prev !== null ? (prev - 1 + count) % count : null
        )
      } else if (e.key === "ArrowRight") {
        setSelectedIndex((prev) =>
          prev !== null ? (prev + 1) % count : null
        )
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.classList.remove("modal-open")
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [selectedIndex, displayProducts.length])

  return (
    <div className="apx-landing apx-font-body min-h-screen bg-surface text-on-surface">
      <main className="!pb-0 pt-16 mix-blend-normal">
        <div className="content-container py-12 lg:py-16">
          {/* Header Section */}
          <div className="mb-10 max-w-3xl">
            <div className="max-w-3xl">
              <h1 className="apx-font-headline text-4xl font-semibold leading-tight text-on-surface md:text-5xl">
                Product <span className="text-primary">Gallery</span>
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-on-surface-variant">
                Explore Apindex pharmaceutical products through a clean visual
                showcase of formulations, dosage forms, and export-ready
                product packaging.
              </p>
            </div>
          </div>

          {/* Grid Section */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {displayProducts.map((product, index) => {
              const FallbackIconComponent = getProductIcon(product)
              const productBadge = getProductBadge(product)

              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl bg-white text-left"
                  aria-label={`View ${product.name} image`}
                >
                  <div className="relative flex aspect-[5/3.6] w-full items-center justify-center bg-surface-lowest">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-contain p-6 mix-blend-multiply"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                    ) : (
                      <FallbackIconComponent className="h-20 w-20 text-on-surface-variant/20" />
                    )}
                  </div>

                  <div className="flex min-h-[92px] flex-1 flex-col justify-between p-4">
                    <span className="text-sm font-semibold text-primary">
                      {productBadge}
                    </span>
                    <h3 className="apx-font-headline mt-2 text-base font-bold leading-snug text-on-surface line-clamp-2">
                      {product.name}
                    </h3>
                  </div>
                </button>
              )
            })}
          </div>

          {displayProducts.length === 0 && (
            <div className="rounded-2xl bg-surface-low py-20 text-center">
              <h3 className="text-xl font-bold text-on-surface">
                No images found
              </h3>
              <p className="mt-2 font-medium text-on-surface-variant">
                Product images will appear here once available.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Lightbox / Slider Modal */}
      {selectedIndex !== null && displayProducts[selectedIndex] && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Product image viewer"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity"
          onClick={handleClose}
        >
          {/* Top Bar with Counter and Close Button */}
          <div className="absolute left-0 right-0 top-0 flex items-center justify-between p-4 px-6 text-white md:p-6 md:px-8">
            <span className="text-lg font-bold">
              {selectedIndex + 1}/{displayProducts.length}
            </span>
            <button
              onClick={handleClose}
              className="rounded-full p-2.5 transition-colors hover:bg-white/20"
              aria-label="Close lightbox"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>

          {/* Prev Button */}
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-md transition-colors hover:bg-black/70 sm:left-6 md:p-3"
            aria-label="Previous product"
          >
            <FaChevronLeft className="text-lg md:text-xl" />
          </button>

          {/* Main Image Container */}
          <div
            className="relative mx-14 flex aspect-square w-full max-w-4xl flex-col items-center justify-center rounded-2xl bg-surface-lowest p-6 shadow-2xl sm:mx-20 md:aspect-auto md:h-[80vh] md:p-12"
            onClick={(e) => e.stopPropagation()}
          >
            {displayProducts[selectedIndex].image_url ? (
              <div className="relative h-full w-full flex-1">
                <Image
                  src={displayProducts[selectedIndex].image_url!}
                  alt={displayProducts[selectedIndex].name}
                  fill
                  className="object-contain"
                  sizes="100vw"
                />
              </div>
            ) : (
              <div className="flex h-full w-full flex-1 items-center justify-center">
                <MdOutlineScience className="h-40 w-40 text-on-surface-variant/20" />
              </div>
            )}
          </div>

          {/* Next Button */}
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-md transition-colors hover:bg-black/70 sm:right-6 md:p-3"
            aria-label="Next product"
          >
            <FaChevronRight className="text-lg md:text-xl" />
          </button>
        </div>
      )}
    </div>
  )
}

"use client"

import { useEffect, useMemo, useState } from "react"
import { Check, Tag } from "lucide-react"

import { CATALOG_DOSAGE_OPTIONS } from "@/lib/constants/product-dosage"
import { cn } from "@/lib/util/cn"

type Category = {
  id: string
  name: string
  handle?: string | null
}

type ProductCategorySelectorProps = {
  categories: Category[]
  selectedCategoryIds: string[]
  selectedSubcategory?: string | null
}

const SUBCATEGORY_OPTIONS = CATALOG_DOSAGE_OPTIONS.filter(
  (option) => option !== "All Dosage Forms"
)

export default function ProductCategorySelector({
  categories,
  selectedCategoryIds,
  selectedSubcategory = null,
}: ProductCategorySelectorProps) {
  const initialCategoryId =
    selectedCategoryIds.find((id) =>
      categories.some((category) => category.id === id)
    ) ?? categories[0]?.id ?? ""
  const [categoryId, setCategoryId] = useState(initialCategoryId)
  const [subcategory, setSubcategory] = useState(selectedSubcategory ?? "")

  useEffect(() => {
    setCategoryId(initialCategoryId)
  }, [initialCategoryId])

  useEffect(() => {
    setSubcategory(selectedSubcategory ?? "")
  }, [selectedSubcategory])

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === categoryId) ?? null,
    [categories, categoryId]
  )

  if (categories.length === 0) {
    return (
      <p className="text-gray-400 text-[10px] italic py-2">
        Add at least one main category before assigning products.
      </p>
    )
  }

  return (
    <div className="space-y-5">
      {categoryId ? (
        <input type="hidden" name="category_ids" value={categoryId} />
      ) : null}
      <input type="hidden" name="product_subcategory" value={subcategory} />

      <div>
        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Main Category
        </label>
        <select
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-bold focus:border-black focus:ring-0"
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {selectedCategory ? (
          <p className="mt-1.5 text-[10px] font-medium text-gray-400">
            Product will be listed under {selectedCategory.name}.
          </p>
        ) : null}
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Sub Category / Dosage Form
          </label>
          <span className="text-[10px] font-medium text-gray-400">
            {subcategory || "Not selected"}
          </span>
        </div>

        <div className="flex max-h-56 flex-wrap gap-2 overflow-y-auto pr-2 custom-scrollbar">
          {SUBCATEGORY_OPTIONS.map((option) => {
            const isSelected = option === subcategory

            return (
              <button
                key={option}
                type="button"
                onClick={() => setSubcategory(isSelected ? "" : option)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold transition-all",
                  isSelected
                    ? "border-black bg-black text-white shadow-md shadow-black/10"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-400 hover:bg-gray-50"
                )}
              >
                {isSelected ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <Tag className="h-3 w-3 text-gray-300" />
                )}
                {option}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

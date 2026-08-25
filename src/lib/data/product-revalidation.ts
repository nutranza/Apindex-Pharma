import { revalidatePath, revalidateTag } from "next/cache"

export function revalidateStorefrontProductPaths(
  handles: Array<string | null | undefined>
) {
  const uniqueHandles = Array.from(
    new Set(
      handles.filter((handle): handle is string => Boolean(handle?.trim()))
    )
  )

  revalidatePath("/")
  revalidatePath("/products")
  revalidatePath("/store")
  revalidatePath("/collections")
  revalidatePath("/categories")
  revalidatePath("/products/[handle]", "page")
  revalidatePath("/collections/[handle]", "page")
  revalidatePath("/categories/[handle]", "page")
  revalidateTag("products", "max")

  uniqueHandles.forEach((handle) => {
    revalidatePath(`/products/${handle}`)
  })
}

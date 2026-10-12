export function ProductResultsLoading() {
  return (
    <div aria-busy="true">
      <p role="status" className="text-lg">
        Loading products…
      </p>
      <div
        aria-hidden="true"
        className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {Array.from({ length: 8 }, (_, index) => (
          <div
            key={index}
            className="h-36 animate-pulse rounded-2xl bg-surface-high"
          />
        ))}
      </div>
    </div>
  )
}

export default function ProductCatalogLoading() {
  return (
    <section
      id="product-catalog"
      className="scroll-mt-24 bg-surface py-14 sm:py-16 lg:py-24"
    >
      <div className="content-container">
        <ProductResultsLoading />
      </div>
    </section>
  )
}

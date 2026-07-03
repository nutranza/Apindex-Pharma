export default function ProductDetailLoading() {
  return (
    <main className="min-h-[60vh] pt-20 md:pt-24">
      <div className="content-container flex min-h-[360px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-secondary-container border-t-secondary" />
          <p className="mt-4 text-sm font-semibold text-on-surface-variant">
            Loading product details...
          </p>
        </div>
      </div>
    </main>
  )
}

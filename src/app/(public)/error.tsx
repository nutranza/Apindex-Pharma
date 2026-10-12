"use client"

export default function PublicError() {
  return (
    <main className="content-container py-32 text-center">
      <h1 className="section-heading">Unable to load this page</h1>
      <p className="mt-4">Please try again in a moment.</p>
      <button type="button" onClick={() => window.location.reload()} className="apx-button-primary mt-6">
        Try again
      </button>
    </main>
  )
}

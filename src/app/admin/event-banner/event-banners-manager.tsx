"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  Description,
} from "@headlessui/react"
import {
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline"
import { deleteEventBanner } from "@/lib/actions/event-banner"
import {
  getEventBannerStatus,
  type EventBannerSettings,
} from "@/lib/types/event-banner"
import { useToast } from "@/modules/common/context/toast-context"
import EventBannerForm from "./event-banner-form"

export default function EventBannersManager({
  initialBanners,
  canEdit,
}: {
  initialBanners: EventBannerSettings[]
  canEdit: boolean
}) {
  const [banners, setBanners] = useState(initialBanners)
  const [editorBanner, setEditorBanner] = useState<EventBannerSettings | null>(
    null
  )
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [isBusy, setIsBusy] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<EventBannerSettings | null>(
    null
  )
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const cancelDelete = useRef<HTMLButtonElement>(null)
  const { showToast } = useToast()
  const router = useRouter()

  useEffect(() => setBanners(initialBanners), [initialBanners])

  function openEditor(banner: EventBannerSettings | null) {
    setEditorBanner(banner)
    setIsBusy(false)
    setIsEditorOpen(true)
  }

  function closeEditor() {
    if (!isBusy) setIsEditorOpen(false)
  }

  function handleSaved(banner: EventBannerSettings) {
    setBanners((previous) =>
      [banner, ...previous.filter((item) => item.id !== banner.id)].sort(
        (a, b) =>
          b.updated_at.localeCompare(a.updated_at) || a.id.localeCompare(b.id)
      )
    )
    setIsEditorOpen(false)
    router.refresh()
  }

  async function handleDelete() {
    if (!deleteTarget || isDeleting || !canEdit) return
    setIsDeleting(true)
    setDeleteError(null)
    try {
      const result = await deleteEventBanner(deleteTarget.id)
      if (!result.success) {
        setDeleteError(result.error)
        return
      }
      setBanners((previous) =>
        previous.filter((item) => item.id !== result.data)
      )
      setDeleteTarget(null)
      showToast("Event permanently deleted.", "success")
      router.refresh()
    } catch {
      setDeleteError("Unable to delete the event. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900">
            Saved events{" "}
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({banners.length})
            </span>
          </h2>
          {canEdit && (
            <button
              type="button"
              onClick={() => openEditor(null)}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
            >
              <PlusIcon className="h-4 w-4" /> Add event
            </button>
          )}
        </div>
        {!canEdit && (
          <p className="px-5 pt-4 text-sm text-gray-500">
            You have view-only access to event settings.
          </p>
        )}
        {banners.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p className="font-medium text-gray-900">No saved events yet</p>
            <p className="mt-2 text-sm text-gray-500">
              {canEdit
                ? "Use Add event to upload an image and choose its dates."
                : "Saved event banners will appear here."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th scope="col" className="px-5 py-3">
                    Event
                  </th>
                  <th scope="col" className="px-5 py-3">
                    Dates (IST)
                  </th>
                  <th scope="col" className="px-5 py-3">
                    Status
                  </th>
                  {canEdit && (
                    <th scope="col" className="px-5 py-3 text-right">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {banners.map((banner) => (
                  <tr key={banner.id}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={banner.image_url}
                          alt={banner.name}
                          className="h-14 w-20 shrink-0 rounded-lg border border-gray-100 bg-gray-50 object-contain"
                        />
                        <span className="max-w-xs break-words font-medium text-gray-900">
                          {banner.name}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                      {formatDate(banner.start_date)} –{" "}
                      {formatDate(banner.end_date)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          getEventBannerStatus(banner) === "Showing"
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {getEventBannerStatus(banner)}
                      </span>
                    </td>
                    {canEdit && (
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            aria-label={`Edit ${banner.name}`}
                            onClick={() => openEditor(banner)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-gray-700 hover:bg-gray-50"
                          >
                            <PencilSquareIcon className="h-4 w-4" /> Edit
                          </button>
                          <button
                            type="button"
                            aria-label={`Delete ${banner.name}`}
                            onClick={() => {
                              setDeleteError(null)
                              setDeleteTarget(banner)
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 px-3 py-2 text-red-600 hover:bg-red-50"
                          >
                            <TrashIcon className="h-4 w-4" /> Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog
        open={isEditorOpen}
        onClose={closeEditor}
        className="fixed inset-0 z-[200]"
      >
        <DialogBackdrop className="fixed inset-0 bg-gray-900/50" />
        <div className="fixed inset-0 overflow-y-auto p-4 sm:p-6">
          <div className="flex min-h-full items-center justify-center">
            <DialogPanel className="relative w-full max-w-2xl rounded-2xl bg-white p-5 shadow-xl sm:p-8">
              <div className="mb-6 flex items-center justify-between gap-4">
                <DialogTitle className="text-xl font-semibold text-gray-900">
                  {editorBanner ? "Edit event" : "Add event"}
                </DialogTitle>
                <button
                  type="button"
                  aria-label="Close event form"
                  onClick={closeEditor}
                  disabled={isBusy}
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-40"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              <EventBannerForm
                key={editorBanner?.id ?? "new"}
                initialBanner={editorBanner}
                canEdit={canEdit}
                onSaved={handleSaved}
                onCancel={closeEditor}
                onBusyChange={setIsBusy}
              />
            </DialogPanel>
          </div>
        </div>
      </Dialog>

      <Dialog
        open={deleteTarget !== null}
        onClose={() => {
          if (!isDeleting) setDeleteTarget(null)
        }}
        initialFocus={cancelDelete}
        className="fixed inset-0 z-[210]"
      >
        <DialogBackdrop className="fixed inset-0 bg-gray-900/50" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <DialogTitle className="text-lg font-semibold text-gray-900">
              Permanently delete event?
            </DialogTitle>
            <Description className="mt-3 text-sm leading-6 text-gray-600">
              “{deleteTarget?.name}” will be removed permanently. This cannot be
              undone.
            </Description>
            {deleteError && (
              <p role="alert" className="mt-4 text-sm text-red-600">
                {deleteError}
              </p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button
                ref={cancelDelete}
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "Deleting…" : "Delete permanently"}
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  )
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(`${value}T00:00:00+05:30`))
}

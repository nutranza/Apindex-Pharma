"use client"

import { useState, type FormEvent } from "react"
import ImageUploader from "@/modules/admin/components/image-uploader"
import { useToast } from "@/modules/common/context/toast-context"
import { saveEventBanner } from "@/lib/actions/event-banner"
import {
  EventBannerSchema,
  type EventBannerInput,
  type EventBannerSettings,
} from "@/lib/types/event-banner"

const IMAGE_FORMATS = ["image/jpeg", "image/png", "image/webp"]
const inputClass =
  "mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"

export default function EventBannerForm({
  initialBanner,
  canEdit,
  onSaved,
  onCancel,
  onBusyChange,
}: {
  initialBanner: EventBannerSettings | null
  canEdit: boolean
  onSaved: (_banner: EventBannerSettings) => void
  onCancel: () => void
  onBusyChange: (_busy: boolean) => void
}) {
  const [form, setForm] = useState<EventBannerInput>(
    initialBanner ?? {
      name: "",
      image_url: "",
      start_date: "",
      end_date: "",
      enabled: false,
    }
  )
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { showToast } = useToast()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canEdit || isUploading || isSaving) return
    const parsed = EventBannerSchema.safeParse(form)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the event details.")
      return
    }
    setError(null)
    setIsSaving(true)
    onBusyChange(true)
    try {
      const result = await saveEventBanner(parsed.data, initialBanner?.id)
      if (!result.success) {
        setError(result.error)
        return
      }
      showToast("Event banner saved.", "success")
      onSaved(result.data)
    } catch {
      setError("Unable to save the event banner. Please try again.")
    } finally {
      setIsSaving(false)
      onBusyChange(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!canEdit && (
        <p className="mb-5 text-sm text-gray-600">
          You have view-only access to event settings.
        </p>
      )}
      <fieldset
        disabled={!canEdit || isSaving}
        className="space-y-6 disabled:opacity-70"
      >
        <div>
          <label
            htmlFor="event-name"
            className="text-sm font-medium text-gray-700"
          >
            Event name
          </label>
          <input
            id="event-name"
            value={form.name}
            maxLength={255}
            required
            className={inputClass}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
          <p className="mt-1 text-xs text-gray-500">
            Describe the event for visitors using screen readers.
          </p>
        </div>
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700">Event image</p>
          <ImageUploader
            folder="event-banners"
            value={form.image_url}
            disabled={!canEdit || isSaving}
            onChange={(image_url) =>
              setForm((previous) => ({ ...previous, image_url }))
            }
            onUploadingChange={(uploading) => {
              setIsUploading(uploading)
              onBusyChange(uploading)
            }}
            acceptedFormats={IMAGE_FORMATS}
            maxSizeMB={5}
          />
        </div>
        <div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="event-start"
                className="text-sm font-medium text-gray-700"
              >
                Start date
              </label>
              <input
                id="event-start"
                type="date"
                value={form.start_date}
                required
                className={inputClass}
                onChange={(event) =>
                  setForm({ ...form, start_date: event.target.value })
                }
              />
            </div>
            <div>
              <label
                htmlFor="event-end"
                className="text-sm font-medium text-gray-700"
              >
                End date
              </label>
              <input
                id="event-end"
                type="date"
                value={form.end_date}
                min={form.start_date || undefined}
                required
                className={inputClass}
                onChange={(event) =>
                  setForm({ ...form, end_date: event.target.value })
                }
              />
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Dates use India Standard Time. The end date is included.
          </p>
        </div>
        <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            role="switch"
            checked={form.enabled}
            onChange={(event) =>
              setForm({ ...form, enabled: event.target.checked })
            }
            className="h-5 w-5 rounded border-gray-300 accent-indigo-600"
          />
          Enable event banner
        </label>
      </fieldset>
      {error && (
        <p role="alert" className="mt-5 text-sm text-red-600">
          {error}
        </p>
      )}
      {canEdit && (
        <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-5">
          <button
            type="button"
            onClick={onCancel}
            disabled={isUploading || isSaving}
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isUploading || isSaving}
            className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUploading
              ? "Uploading image…"
              : isSaving
              ? "Saving…"
              : "Save event banner"}
          </button>
        </div>
      )}
    </form>
  )
}

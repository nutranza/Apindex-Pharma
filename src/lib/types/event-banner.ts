import { z } from "zod"

export const EventBannerSchema = z
  .object({
    name: z.string().trim().min(1, "Enter an event name.").max(255),
    image_url: z.string().url("Upload an event image."),
    start_date: z.iso.date("Choose a valid start date."),
    end_date: z.iso.date("Choose a valid end date."),
    enabled: z.boolean(),
  })
  .refine((value) => value.end_date >= value.start_date, {
    message: "End date must be on or after the start date.",
    path: ["end_date"],
  })

export type EventBannerInput = z.infer<typeof EventBannerSchema>
export type EventBannerSettings = EventBannerInput & {
  id: string
  updated_at: string
}

export const PublicEventBannerSchema = z.object({
  name: z.string().min(1),
  image_url: z.string().url(),
  start_date: z.iso.date(),
  end_date: z.iso.date(),
})

export const EventBannerResponseSchema = z.object({
  banner: PublicEventBannerSchema.nullable(),
})

export type PublicEventBanner = z.infer<typeof PublicEventBannerSchema>
export type EventBannerResponse = z.infer<typeof EventBannerResponseSchema>

export function getIndiaDate(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now)
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((value) => value.type === type)?.value ?? ""
  return `${part("year")}-${part("month")}-${part("day")}`
}

export function getEventBannerStatus(
  banner: EventBannerInput | null,
  today = getIndiaDate()
): "Disabled" | "Scheduled" | "Showing" | "Ended" {
  if (!banner?.enabled) return "Disabled"
  if (banner.start_date > today) return "Scheduled"
  if (banner.end_date < today) return "Ended"
  return "Showing"
}

export function isEventBannerImageUrl(value: string, baseUrl: string): boolean {
  try {
    const url = new URL(value)
    const prefix = new URL(`${baseUrl.replace(/\/+$/, "")}/event-banners/`)
    const filename = url.pathname.slice(prefix.pathname.length)
    return (
      url.origin === prefix.origin &&
      url.pathname.startsWith(prefix.pathname) &&
      /^[0-9a-f-]+\.(jpeg|png|webp)$/i.test(filename) &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash
    )
  } catch {
    return false
  }
}

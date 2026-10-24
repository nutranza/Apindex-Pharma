"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { ensureAdmin } from "@/lib/data/admin"
import { requirePermission } from "@/lib/permissions/server"
import { PERMISSIONS } from "@/lib/permissions"
import { createClient } from "@/lib/supabase/server"
import {
  EventBannerSchema,
  isEventBannerImageUrl,
  type EventBannerSettings,
} from "@/lib/types/event-banner"
import type { ActionResult } from "@/lib/types/action-result"
import { getProductMediaBaseUrl } from "@/lib/util/images"

const EventIdSchema = z.string().trim().min(1).max(100)

export async function saveEventBanner(
  input: unknown,
  id?: string
): Promise<ActionResult<EventBannerSettings>> {
  await ensureAdmin()
  await requirePermission(PERMISSIONS.HOME_SETTINGS_UPDATE)

  if (id !== undefined && !EventIdSchema.safeParse(id).success) {
    return { success: false, error: "Invalid event ID." }
  }

  const parsed = EventBannerSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Check the event details.",
    }
  }

  const base = getProductMediaBaseUrl()
  if (!base)
    return { success: false, error: "Event image storage is not configured." }
  if (!isEventBannerImageUrl(parsed.data.image_url, base)) {
    return {
      success: false,
      error: "Upload an image using the event banner uploader.",
    }
  }

  try {
    const supabase = await createClient()
    const values = { ...parsed.data, updated_at: new Date().toISOString() }
    const query =
      id === undefined
        ? supabase.from("event_banner_settings").insert(values)
        : supabase.from("event_banner_settings").update(values).eq("id", id)
    const { data, error } = await query
      .select("id, name, image_url, start_date, end_date, enabled, updated_at")
      .single<EventBannerSettings>()
    if (error) throw error
    revalidatePath("/admin/event-banner")
    return { success: true, data }
  } catch (error) {
    console.error("Unable to save event banner:", error)
    return {
      success: false,
      error: "Unable to save the event banner. Please try again.",
    }
  }
}

export async function deleteEventBanner(
  id: string
): Promise<ActionResult<string>> {
  await ensureAdmin()
  await requirePermission(PERMISSIONS.HOME_SETTINGS_UPDATE)
  if (!EventIdSchema.safeParse(id).success) {
    return { success: false, error: "Invalid event ID." }
  }
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("event_banner_settings")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle<{ id: string }>()
    if (error) throw error
    if (!data)
      return {
        success: false,
        error: "This event no longer exists. Refresh the list.",
      }
    revalidatePath("/admin/event-banner")
    return { success: true, data: data.id }
  } catch (error) {
    console.error("Unable to delete event banner:", error)
    return {
      success: false,
      error: "Unable to delete the event. Please try again.",
    }
  }
}

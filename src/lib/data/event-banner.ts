import "server-only"

import { createClient } from "@/lib/supabase/server"
import { ensureAdmin } from "@/lib/data/admin"
import { requirePermission } from "@/lib/permissions/server"
import { PERMISSIONS } from "@/lib/permissions"
import {
  getIndiaDate,
  type EventBannerSettings,
  type PublicEventBanner,
} from "@/lib/types/event-banner"

export async function getEventBannersAdmin(): Promise<EventBannerSettings[]> {
  await ensureAdmin()
  await requirePermission(PERMISSIONS.HOME_SETTINGS_READ)
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("event_banner_settings")
    .select("id, name, image_url, start_date, end_date, enabled, updated_at")
    .order("updated_at", { ascending: false })
    .order("id", { ascending: true })
    .overrideTypes<EventBannerSettings[]>()
  if (error) throw new Error("Unable to load event settings. Please try again.")
  return data ?? []
}

export async function getCurrentEventBanner(): Promise<PublicEventBanner | null> {
  const supabase = await createClient()
  const today = getIndiaDate()
  const { data, error } = await supabase
    .from("event_banner_settings")
    .select("name, image_url, start_date, end_date")
    .eq("enabled", true)
    .lte("start_date", today)
    .gte("end_date", today)
    .order("start_date", { ascending: false })
    .order("updated_at", { ascending: false })
    .order("id", { ascending: true })
    .limit(1)
    .maybeSingle<PublicEventBanner>()
  if (error) throw error
  return data
}

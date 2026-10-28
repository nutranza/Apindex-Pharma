import { NextResponse } from "next/server"
import { getCurrentEventBanner } from "@/lib/data/event-banner"
import type { EventBannerResponse } from "@/lib/types/event-banner"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    return NextResponse.json<EventBannerResponse>(
      { banner: await getCurrentEventBanner() },
      { headers: { "Cache-Control": "no-store" } }
    )
  } catch (error) {
    console.error("Unable to load event banner:", error)
    return NextResponse.json<EventBannerResponse>(
      { banner: null },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    )
  }
}

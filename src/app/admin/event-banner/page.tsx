import AdminPageHeader from "@/modules/admin/components/admin-page-header"
import { getEventBannersAdmin } from "@/lib/data/event-banner"
import { checkPermission } from "@/lib/permissions/server"
import { PERMISSIONS } from "@/lib/permissions"
import EventBannersManager from "./event-banners-manager"

export const metadata = {
  title: "Event Banner | Apindex Admin",
  description: "Manage the scheduled homepage event banner",
}

export default async function EventBannerPage() {
  const banners = await getEventBannersAdmin()
  const canEdit = await checkPermission(PERMISSIONS.HOME_SETTINGS_UPDATE)
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Event Banner"
        subtitle="Manage saved events. When dates overlap, the latest start date is shown; the most recently updated event wins a tie."
      />
      <EventBannersManager initialBanners={banners} canEdit={canEdit} />
    </div>
  )
}

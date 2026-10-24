import LandingPageTemplate from "@modules/landing/templates/landing-page"
import EventBannerPopup from "@modules/landing/components/event-banner-popup"

export default function RootPage() {
  return (
    <>
      <LandingPageTemplate />
      <EventBannerPopup />
    </>
  )
}

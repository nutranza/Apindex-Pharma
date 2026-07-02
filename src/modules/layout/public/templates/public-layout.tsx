import type { ReactNode } from "react"
import FooterSection from "@/modules/layout/public/components/footer-section"
import ScrollToTopButton from "@/modules/layout/public/components/scroll-to-top-button"
import TopNavBar from "@/modules/layout/public/components/top-nav-bar"

type PublicLayoutProps = {
  children: ReactNode
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <>
      <TopNavBar />
      {children}
      <FooterSection />
      <ScrollToTopButton />
    </>
  )
}

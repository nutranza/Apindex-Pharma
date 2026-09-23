import { FaWhatsapp } from "react-icons/fa6"
import { WHATSAPP_URL } from "@/modules/layout/public/constants"

export default function WhatsAppFloatingButton() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Open WhatsApp chat"
      title="Chat on WhatsApp"
      className="whatsapp-launcher fixed bottom-5 left-5 z-40 inline-flex size-14 items-center justify-center rounded-full bg-[#25D366] text-3xl text-white shadow-lg transition-transform hover:scale-105 hover:bg-[#1ebe5d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 sm:bottom-6 sm:left-6 sm:size-16 small:hidden"
    >
      <FaWhatsapp aria-hidden="true" />
    </a>
  )
}

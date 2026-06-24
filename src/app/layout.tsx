import type { Metadata } from "next"
import { poppins } from "@lib/fonts"
import Providers from "./providers"
import "@/styles/globals.css"

export const metadata: Metadata = {
  title: {
    template: "%s | Apindex",
    default: "Apindex",
  },
  description:
    "Apindex pharmaceutical solutions and admin backend operations.",
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "64x64", type: "image/png" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-mode="light"
      suppressHydrationWarning
      className={poppins.variable}
    >
      <body suppressHydrationWarning className="font-sans">
        <Providers>{props.children}</Providers>
      </body>
    </html>
  )
}

"use client"

import type { ReactNode } from "react"
import NextTopLoader from "nextjs-toploader"
import ToastDisplay from "@modules/common/components/toast-display"
import { ToastProvider } from "@modules/common/context/toast-context"

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <NextTopLoader
        color="#64b51f"
        height={4}
        showSpinner={false}
        shadow="0 0 10px rgba(100, 181, 31, 0.35)"
      />
      <ToastDisplay />
      {children}
    </ToastProvider>
  )
}

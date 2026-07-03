"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import type { ActionResult } from "@/lib/types/action-result"
import { createClient } from "@/lib/supabase/server"

const ADMIN_LOGIN_DEFAULT_REDIRECT = "/admin"
const SIMPLE_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function sanitizeAdminRedirect(value: string | null): string {
  const trimmedValue = value?.trim()

  if (
    !trimmedValue ||
    !trimmedValue.startsWith("/admin") ||
    trimmedValue.startsWith("//")
  ) {
    return ADMIN_LOGIN_DEFAULT_REDIRECT
  }

  return trimmedValue
}

function getRequestedAdminRedirect(formData: FormData): string {
  return sanitizeAdminRedirect(
    (formData.get("returnUrl") as string | null) ||
      (formData.get("next") as string | null)
  )
}

export async function loginAdminWithPassword(
  _currentState: unknown,
  formData: FormData
): Promise<ActionResult> {
  const email = ((formData.get("email") as string) || "")
    .trim()
    .toLowerCase()
  const password = ((formData.get("password") as string) || "").trim()
  const redirectTo = getRequestedAdminRedirect(formData)

  if (!SIMPLE_EMAIL_REGEX.test(email)) {
    return { success: false, error: "Enter a valid admin email address." }
  }

  if (!password) {
    return { success: false, error: "Enter your password." }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error || !data.user) {
    return { success: false, error: "Invalid email or password." }
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, admin_role_id")
    .eq("id", data.user.id)
    .maybeSingle()

  if (profileError || profile?.role !== "admin") {
    await supabase.auth.signOut()
    return {
      success: false,
      error: "This account does not have admin access.",
    }
  }

  revalidatePath("/", "layout")
  revalidatePath("/admin", "layout")
  redirect(redirectTo)
}

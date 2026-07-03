import { createAdminUserWithPassword, getAdminRoles } from "@/lib/data/admin"
import type { ActionResult } from "@/lib/types/action-result"
import AdminPageHeader from "@modules/admin/components/admin-page-header"
import AdminCard from "@modules/admin/components/admin-card"
import CreateAdminForm from "./create-admin-form"
import Link from "next/link"
import { ChevronLeftIcon } from "@heroicons/react/24/outline"
import { redirect } from "next/navigation"

async function handleCreateAdmin(
  _currentState: unknown,
  formData: FormData
): Promise<ActionResult> {
  "use server"
  const firstName = ((formData.get("first_name") as string) || "").trim()
  const lastName = ((formData.get("last_name") as string) || "").trim()
  const email = ((formData.get("email") as string) || "").trim()
  const password = ((formData.get("password") as string) || "").trim()
  const roleId = ((formData.get("role_id") as string) || "").trim()

  try {
    await createAdminUserWithPassword({
      email,
      password,
      roleId,
      firstName,
      lastName,
    })
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create admin user.",
    }
  }

  redirect("/admin/team")
}

export default async function AddStaff() {
  const roles = await getAdminRoles()

  return (
    <div className="max-w-2xl space-y-6">
      <nav className="flex items-center text-xs font-bold text-gray-400 uppercase tracking-widest">
        <Link
          href="/admin/team"
          className="flex items-center hover:text-black transition-colors"
        >
          <ChevronLeftIcon className="h-3 w-3 mr-1" strokeWidth={3} />
          Back to Team
        </Link>
      </nav>

      <AdminPageHeader
        title="Add Staff Member"
        subtitle="Create an admin login with email, temporary password, and role."
      />

      <AdminCard>
        <CreateAdminForm roles={roles} createAction={handleCreateAdmin} />
      </AdminCard>
    </div>
  )
}

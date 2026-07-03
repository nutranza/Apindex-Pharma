"use client"

import { useActionState } from "react"
import Link from "next/link"

import type { ActionResult } from "@/lib/types/action-result"
import SubmitButton from "./submit-button"

type AdminRoleOption = {
  id: string
  name: string
  is_system: boolean | null
}

type CreateAdminFormProps = {
  roles: AdminRoleOption[]
  createAction: (
    currentState: unknown,
    formData: FormData
  ) => Promise<ActionResult>
}

export default function CreateAdminForm({
  roles,
  createAction,
}: CreateAdminFormProps) {
  const [state, formAction] = useActionState(createAction, null)
  const errorMessage = state && !state.success ? state.error : null

  return (
    <form action={formAction} className="space-y-6">
      {errorMessage && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          role="alert"
        >
          {errorMessage}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="first_name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            First name
          </label>
          <input
            id="first_name"
            name="first_name"
            type="text"
            required
            placeholder="Enter first name"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label
            htmlFor="last_name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Last name
          </label>
          <input
            id="last_name"
            name="last_name"
            type="text"
            required
            placeholder="Enter last name"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Email ID
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="admin@example.com"
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
        <p className="mt-2 text-xs text-gray-500">
          This email ID will be used by the staff member to log in.
        </p>
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Temporary password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="Minimum 8 characters"
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
        <p className="mt-2 text-xs text-gray-500">
          Share this password securely with the admin user. Do not store it
          anywhere else.
        </p>
      </div>

      <div>
        <label
          htmlFor="role_id"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Role
        </label>
        <select
          id="role_id"
          name="role_id"
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">Select a role...</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name} {role.is_system && "(System)"}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Link
          href="/admin/team"
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          Cancel
        </Link>
        <SubmitButton />
      </div>
    </form>
  )
}

import Link from "next/link"
import { EyeIcon, UsersIcon } from "@heroicons/react/24/outline"

import AdminPageHeader from "@modules/admin/components/admin-page-header"
import { AdminTableWrapper } from "@modules/admin/components/admin-table-wrapper"
import { getVisitorRegistrations } from "@/lib/data/visitor-registrations"

export const metadata = {
  title: "Visitor Registrations | Apindex Admin",
  description: "View Nairobi Expo visitor registrations",
}

export default async function VisitorRegistrationsPage() {
  const registrations = await getVisitorRegistrations()

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Visitor Registrations"
        subtitle={`${registrations.length} Nairobi Expo registration${registrations.length === 1 ? "" : "s"}`}
      />

      {registrations.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-20 text-center shadow-sm">
          <UsersIcon className="mx-auto h-12 w-12 text-gray-200" />
          <p className="mt-4 text-sm font-semibold text-gray-900">
            No visitor registrations yet
          </p>
          <p className="mt-1 text-sm text-gray-500">
            New Nairobi Expo submissions will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <AdminTableWrapper>
            <table className="w-full min-w-[900px] text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Submitted</th>
                  <th className="px-6 py-3 font-medium">Visitor</th>
                  <th className="px-6 py-3 font-medium">Company</th>
                  <th className="px-6 py-3 font-medium">Email</th>
                  <th className="px-6 py-3 font-medium">WhatsApp</th>
                  <th className="px-6 py-3 font-medium">Location</th>
                  <th className="px-6 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {registrations.map((registration) => (
                  <tr key={registration.id} className="hover:bg-gray-50/60">
                    <td className="whitespace-nowrap px-6 py-4 text-gray-500">
                      {formatDate(registration.created_at)}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {registration.first_name} {registration.last_name}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {registration.company_name}
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={`mailto:${registration.email}`}
                        className="text-indigo-600 hover:underline"
                      >
                        {registration.email}
                      </a>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {registration.whatsapp_number}
                    </td>
                    <td className="px-6 py-4">
                      {registration.county_country}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/visitor-registrations/${registration.id}`}
                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-50"
                      >
                        <EyeIcon className="h-4 w-4" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminTableWrapper>
        </div>
      )}
    </div>
  )
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

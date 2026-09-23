import Link from "next/link"
import { notFound } from "next/navigation"
import type { ReactNode } from "react"

import AdminPageHeader from "@modules/admin/components/admin-page-header"
import { getVisitorRegistration } from "@/lib/data/visitor-registrations"

export const metadata = {
  title: "Visitor Registration Details | Apindex Admin",
  description: "View a Nairobi Expo visitor registration",
}

export default async function VisitorRegistrationDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const registration = await getVisitorRegistration(id)

  if (!registration) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title={`${registration.first_name} ${registration.last_name}`}
        subtitle={`Submitted ${formatDate(registration.created_at)}`}
        backHref="/admin/visitor-registrations"
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <DetailsCard title="Contact information">
          <DetailItem label="First Name" value={registration.first_name} />
          <DetailItem label="Last Name" value={registration.last_name} />
          <DetailItem
            label="Company / Business Name"
            value={registration.company_name}
          />
          <DetailItem
            label="Designation in Company / Business"
            value={registration.designation}
          />
          <DetailItem
            label="WhatsApp Number with Country Code"
            value={registration.whatsapp_number}
          />
          <DetailItem label="Email" value={registration.email} />
          <DetailItem label="Website" value={registration.website} />
          <DetailItem
            label="County and Country"
            value={registration.county_country}
          />
        </DetailsCard>

        <DetailsCard title="Expo information">
          <DetailItem
            label="Industry You Belong To"
            value={formatList(registration.industries)}
          />
          <DetailItem
            label="Other Industry"
            value={registration.industry_other}
          />
          <DetailItem
            label="Your Business Type"
            value={formatList(registration.business_types)}
          />
          <DetailItem
            label="Other Business Type"
            value={registration.business_type_other}
          />
          <DetailItem
            label="What Are You Looking For at the Expo?"
            value={registration.looking_for}
          />
          <DetailItem
            label="Products or partnerships sought"
            value={registration.partnership_interest}
          />
          <DetailItem
            label="How did you get to know about this Expo?"
            value={registration.referral_source}
          />
          <DetailItem
            label="Other Referral Source"
            value={registration.referral_source_other}
          />
          <DetailItem
            label="Privacy Policy agreement"
            value={registration.privacy_consent ? "Agreed" : "Not agreed"}
          />
        </DetailsCard>
      </div>

      <Link
        href="/admin/visitor-registrations"
        className="w-fit text-sm font-medium text-indigo-600 hover:underline"
      >
        Back to visitor registrations
      </Link>
    </div>
  )
}

function DetailsCard({
  children,
  title,
}: {
  children: ReactNode
  title: string
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-base font-semibold text-gray-900">{title}</h2>
      <dl className="divide-y divide-gray-100">
        {children}
      </dl>
    </section>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] sm:gap-4">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="whitespace-pre-wrap break-words text-sm text-gray-900">
        {value.trim() || "—"}
      </dd>
    </div>
  )
}

function formatList(values: string[]): string {
  return values.length > 0 ? values.join(", ") : ""
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

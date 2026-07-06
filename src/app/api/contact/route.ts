import { NextResponse } from "next/server"
import { z } from "zod"

import { sendContactInquiryEmail } from "@/lib/email/contact-mail"

export const runtime = "nodejs"

const contactInquirySchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, "Enter your full name")
    .max(120, "Full name is too long"),
  work_email: z
    .string()
    .trim()
    .email("Enter a valid work email")
    .max(160, "Work email is too long"),
  phone_number: z.string().trim().max(40, "Phone number is too long").optional(),
  country: z
    .string()
    .trim()
    .min(2, "Select your country")
    .max(120, "Country is too long"),
  message: z
    .string()
    .trim()
    .min(10, "Tell us a little more about your inquiry")
    .max(4000, "Message is too long"),
  company_website: z.string().optional(),
})

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  })
}

export async function POST(request: Request) {
  let payload: unknown

  try {
    payload = await request.json()
  } catch {
    return jsonResponse(
      {
        success: false,
        message: "Invalid contact form request.",
      },
      400
    )
  }

  const parsed = contactInquirySchema.safeParse(payload)

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]

    return jsonResponse(
      {
        success: false,
        message: firstIssue?.message || "Please check the form and try again.",
      },
      400
    )
  }

  const data = parsed.data

  if (data.company_website?.trim()) {
    return jsonResponse({
      success: true,
      message: "Your inquiry has been sent successfully.",
    })
  }

  try {
    await sendContactInquiryEmail({
      fullName: data.full_name,
      workEmail: data.work_email,
      phoneNumber: data.phone_number,
      country: data.country,
      message: data.message,
    })

    return jsonResponse({
      success: true,
      message: "Your inquiry has been sent successfully.",
    })
  } catch (error) {
    console.error("Contact form email failed:", error)

    return jsonResponse(
      {
        success: false,
        message:
          "We could not send your inquiry right now. Please try again or email us directly.",
      },
      500
    )
  }
}

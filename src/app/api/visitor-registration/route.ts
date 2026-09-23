import { NextResponse } from "next/server"
import { z } from "zod"

import { createVisitorRegistration } from "@/lib/data/visitor-registrations"
import {
  BUSINESS_TYPE_OPTIONS,
  INDUSTRY_OPTIONS,
  LOOKING_FOR_OPTIONS,
  REFERRAL_SOURCE_OPTIONS,
} from "@/modules/visitor-registration/constants"

export const runtime = "nodejs"

const visitorRegistrationSchema = z
  .object({
    firstName: z.string().trim().min(1, "Enter your first name").max(120),
    lastName: z.string().trim().min(1, "Enter your last name").max(120),
    companyName: z
      .string()
      .trim()
      .min(1, "Enter your company or business name")
      .max(200),
    designation: z
      .string()
      .trim()
      .min(1, "Enter your designation")
      .max(160),
    whatsappNumber: z
      .string()
      .trim()
      .regex(/^\d{10,13}$/, "Enter 10 to 13 digits with the country code"),
    email: z.string().trim().email("Enter a valid email address").max(160),
    website: z.string().trim().min(1, "Enter your website").max(300),
    countyCountry: z
      .string()
      .trim()
      .min(1, "Enter your county and country")
      .max(200),
    industries: z
      .array(z.enum(INDUSTRY_OPTIONS))
      .min(1, "Select at least one industry"),
    industryOther: z.string().trim().max(200).default(""),
    businessTypes: z
      .array(z.enum(BUSINESS_TYPE_OPTIONS))
      .min(1, "Select at least one business type"),
    businessTypeOther: z.string().trim().max(200).default(""),
    lookingFor: z.enum(LOOKING_FOR_OPTIONS),
    partnershipInterest: z.string().trim().max(2000).default(""),
    referralSource: z.enum(REFERRAL_SOURCE_OPTIONS),
    referralSourceOther: z.string().trim().max(200).default(""),
    privacyConsent: z.literal(true, {
      error: "Please agree to the Privacy Policy",
    }),
  })
  .superRefine((data, context) => {
    if (data.industries.includes("Other") && !data.industryOther.trim()) {
      context.addIssue({
        code: "custom",
        path: ["industryOther"],
        message: "This field is required.",
      })
    }

    if (data.businessTypes.includes("Other") && !data.businessTypeOther.trim()) {
      context.addIssue({
        code: "custom",
        path: ["businessTypeOther"],
        message: "This field is required.",
      })
    }

    if (data.referralSource === "Other" && !data.referralSourceOther.trim()) {
      context.addIssue({
        code: "custom",
        path: ["referralSourceOther"],
        message: "This field is required.",
      })
    }
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
        message: "Invalid visitor registration request.",
      },
      400
    )
  }

  const parsed = visitorRegistrationSchema.safeParse(payload)

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

  try {
    await createVisitorRegistration(parsed.data)

    return jsonResponse({
      success: true,
      message: "Visitor registration submitted successfully.",
    })
  } catch (error) {
    console.error("Visitor registration database insert failed:", error)

    return jsonResponse(
      {
        success: false,
        message:
          "We could not save your registration right now. Please try again.",
      },
      500
    )
  }
}

import "server-only"

import nodemailer from "nodemailer"

export type ContactInquiryEmailInput = {
  fullName: string
  workEmail: string
  phoneNumber?: string
  country: string
  message: string
}

function requireEnv(name: string): string {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`${name} is not configured`)
  }

  return value
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

function renderRows(input: ContactInquiryEmailInput): string {
  const rows = [
    ["Full Name", input.fullName],
    ["Work Email", input.workEmail],
    ["Phone Number", input.phoneNumber || "Not provided"],
    ["Country", input.country],
  ]

  return rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding: 14px 18px; border-bottom: 1px solid #e8edf3; font-size: 13px; font-weight: 700; letter-spacing: 0.02em; color: #64748b; width: 170px; vertical-align: top;">${escapeHtml(label)}</td>
          <td style="padding: 14px 18px; border-bottom: 1px solid #e8edf3; font-size: 15px; font-weight: 600; color: #172033; vertical-align: top;">${escapeHtml(value)}</td>
        </tr>
      `
    )
    .join("")
}

function buildHtmlContent(input: ContactInquiryEmailInput): string {
  const messageHtml = escapeHtml(input.message).replace(/\n/g, "<br />")
  const escapedEmail = escapeHtml(input.workEmail)
  const escapedName = escapeHtml(input.fullName)

  return `
    <!doctype html>
    <html>
      <body style="margin: 0; padding: 0; background: #f4f7f2; font-family: Arial, Helvetica, sans-serif; color: #172033;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; background: #f4f7f2; margin: 0; padding: 0;">
          <tr>
            <td align="center" style="padding: 32px 14px;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; width: 100%; max-width: 720px; background: #ffffff; border: 1px solid #dfe7da; border-radius: 18px; overflow: hidden; box-shadow: 0 14px 34px rgba(31, 65, 21, 0.10);">
                <tr>
                  <td style="padding: 28px 30px; background: #5ead18;">
                    <div style="font-size: 12px; line-height: 1.2; font-weight: 800; letter-spacing: 0.12em; color: #fff2c5; text-transform: uppercase;">Apindex Website</div>
                    <h1 style="margin: 10px 0 0; font-size: 28px; line-height: 1.18; font-weight: 800; color: #ffffff;">New Contact Inquiry</h1>
                    <p style="margin: 10px 0 0; font-size: 15px; line-height: 1.55; color: #ecffd8;">A new business inquiry was submitted from the Apindex contact form.</p>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 26px 30px 10px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; background: #fbfdf9; border: 1px solid #e2eadc; border-radius: 14px; overflow: hidden;">
                      <tbody>${renderRows(input)}</tbody>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 18px 30px 4px;">
                    <div style="font-size: 12px; line-height: 1.2; font-weight: 800; letter-spacing: 0.12em; color: #f39a16; text-transform: uppercase;">Inquiry Message</div>
                    <div style="margin-top: 10px; padding: 18px 20px; border: 1px solid #e4e9ef; border-radius: 14px; background: #ffffff; color: #273244; font-size: 15px; line-height: 1.7;">
                      ${messageHtml}
                    </div>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 22px 30px 30px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                      <tr>
                        <td style="border-radius: 10px; background: #f39a16;">
                          <a href="mailto:${escapedEmail}?subject=Re:%20Apindex%20Inquiry" style="display: inline-block; padding: 13px 20px; color: #ffffff; font-size: 14px; font-weight: 800; text-decoration: none;">Reply to ${escapedName}</a>
                        </td>
                      </tr>
                    </table>
                    <p style="margin: 16px 0 0; font-size: 12px; line-height: 1.55; color: #6b7280;">Use Reply in Gmail or the button above. The visitor email is set as the reply-to address.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `
}

function buildTextContent(input: ContactInquiryEmailInput): string {
  return [
    "New Apindex Contact Inquiry",
    "",
    `Full Name: ${input.fullName}`,
    `Work Email: ${input.workEmail}`,
    `Phone Number: ${input.phoneNumber || "Not provided"}`,
    `Country: ${input.country}`,
    "",
    "Message:",
    input.message,
  ].join("\n")
}

export async function sendContactInquiryEmail(input: ContactInquiryEmailInput) {
  const host = process.env.SMTP_HOST?.trim() || "smtp.gmail.com"
  const configuredPort = Number(process.env.SMTP_PORT?.trim() || "465")
  const port = Number.isFinite(configuredPort) ? configuredPort : 465
  const secure = (process.env.SMTP_SECURE?.trim() || "true") !== "false"
  const user = requireEnv("SMTP_USER")
  const pass = requireEnv("SMTP_PASS")
  const recipient = requireEnv("CONTACT_FORM_RECIPIENT")
  const sender = process.env.CONTACT_FORM_SENDER?.trim() || user

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  })

  return transporter.sendMail({
    from: {
      name: "Apindex Website",
      address: sender,
    },
    to: recipient,
    replyTo: {
      name: input.fullName,
      address: input.workEmail,
    },
    subject: `New inquiry from ${input.fullName}`,
    text: buildTextContent(input),
    html: buildHtmlContent(input),
  })
}

import { expect, test } from "@playwright/test"

const REGISTRATION_PATH = "/kenya-expo"

const INDUSTRIES = [
  "Auto, Tools & Hardware",
  "Build, Decore & Secure",
  "Electrical, Electronics & ICT",
  "Energy, Solar & Power",
  "Food, Kitchen & Agriculture",
  "Industrial Equipment & Machinery",
  "Medical, Health & Pharma",
  "Textile, Apparel & Fashion",
]

const BUSINESS_TYPES = [
  "Importer",
  "Dealer / Distributor",
  "Retailer",
  "Manufacturer",
  "Service Provider",
  "Start Up/ Entrepreneur",
]

const LOOKING_FOR = [
  "Find new Indian suppliers or partners",
  "Explore dealership or franchise opportunities",
  "B2B meetings",
  "Learn about new technologies",
  "Networking & Market Insight",
]

const REFERRAL_SOURCES = [
  "Social Media",
  "WhatsApp Message",
  "Newspaper Ad",
  "Radio Jingle",
  "Email from Organizer",
  "Invite from Exhibitor",
  "Invite from Local Chambers / Association",
]

test("header links to the Expo Nairobi visitor registration form", async ({
  page,
}) => {
  await page.goto("/")

  const registrationLink = page.getByRole("link", {
    name: "Visitor Registration",
    exact: true,
  })

  await expect(registrationLink).toBeVisible()
  await expect(registrationLink).toHaveAttribute("href", REGISTRATION_PATH)
})

test("mobile navigation exposes visitor registration", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/")

  await page.getByRole("button", { name: "Open navigation menu" }).click()

  const mobileNavigation = page.locator("#apindex-mobile-navigation")
  const registrationLink = mobileNavigation.getByRole("link", {
    name: "Visitor Registration",
    exact: true,
  })

  await expect(registrationLink).toBeVisible()
  await expect(registrationLink).toHaveAttribute("href", REGISTRATION_PATH)
})

test("visitor registration form matches the reference fields and options", async ({
  page,
}) => {
  await page.goto(REGISTRATION_PATH)

  await expect(
    page.getByRole("heading", {
      name: /7th International Indo-Africa B2B Trade Expo.*Visitor Registration Form/,
    })
  ).toBeVisible()

  for (const label of [
    "First Name",
    "Last Name",
    "Company / Business Name",
    "Designation in Company / Business",
    "WhatsApp Number with Country Code",
    "Website",
    "County and Country",
    "Tell us briefly what kind of products or partnerships you’re seeking:",
  ]) {
    await expect(page.getByLabel(label)).toBeVisible()
  }

  await expect(page.locator('input[name="email"]')).toBeVisible()

  for (const option of INDUSTRIES) {
    await expect(page.getByText(option, { exact: true })).toBeVisible()
  }

  for (const option of BUSINESS_TYPES) {
    await expect(page.getByText(option, { exact: true })).toBeVisible()
  }

  for (const option of LOOKING_FOR) {
    await expect(page.getByText(option, { exact: true })).toBeVisible()
  }

  for (const option of REFERRAL_SOURCES) {
    await expect(page.getByText(option, { exact: true })).toBeVisible()
  }

  await expect(
    page.getByRole("radio", {
      name: "Find new Indian suppliers or partners",
    })
  ).toBeChecked()
  await expect(page.getByPlaceholder("Nairobi, Kenya")).toBeVisible()
  await expect(
    page.getByRole("checkbox", { name: /I agree to our Privacy Policy/ })
  ).toBeVisible()

  await page.locator('input[name="industries"][value="Other"]').check()
  await expect(
    page.getByPlaceholder("Please type another option here").first()
  ).toBeVisible()

  await page.locator('input[name="businessTypes"][value="Other"]').check()
  await expect(
    page.getByPlaceholder("Please type another option here").nth(1)
  ).toBeVisible()

  await page.getByRole("radio", { name: "Other", exact: true }).check()
  await expect(
    page.getByPlaceholder("Please type another option here").nth(2)
  ).toBeVisible()
})

test("visitor registration blocks invalid data and shows success after submission", async ({
  page,
}) => {
  await page.route("**/api/visitor-registration", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        message: "Visitor registration submitted successfully.",
      }),
    })
  })

  await page.goto(REGISTRATION_PATH)

  const whatsappNumber = page.locator('input[name="whatsappNumber"]')
  await whatsappNumber.fill("12345")
  expect(
    await whatsappNumber.evaluate(
      (element) => !(element as HTMLInputElement).validity.valid
    )
  ).toBe(true)

  await page.getByLabel("First Name").fill("Asha")
  await page.getByLabel("Last Name").fill("Patel")
  await page
    .getByLabel("Company / Business Name")
    .fill("Asha Pharma")
  await page
    .getByLabel("Designation in Company / Business")
    .fill("Director")
  await whatsappNumber.fill("254712345678")
  await page.locator('input[name="email"]').fill("asha@example.com")
  await page.getByLabel("Website").fill("example.com")
  await page.getByLabel("County and Country").fill("Nairobi, Kenya")
  await page
    .locator('input[name="industries"][value="Medical, Health & Pharma"]')
    .check()
  await page.locator('input[name="businessTypes"][value="Importer"]').check()
  await page.getByRole("radio", { name: "Social Media" }).check()
  await page
    .getByRole("checkbox", { name: /I agree to our Privacy Policy/ })
    .check()

  await page.getByRole("button", { name: "Submit" }).click()

  await expect(page.getByRole("status")).toHaveText(
    "Visitor registration submitted successfully."
  )
  await expect(page.getByLabel("First Name")).toHaveValue("")
})

test("visitor registration API rejects invalid input", async ({ request }) => {
  const response = await request.post("/api/visitor-registration", {
    data: {
      firstName: "",
      lastName: "Visitor",
      companyName: "Example Company",
      designation: "Buyer",
      whatsappNumber: "123",
      email: "not-an-email",
      website: "example.com",
      countyCountry: "Nairobi, Kenya",
      industries: [],
      industryOther: "",
      businessTypes: [],
      businessTypeOther: "",
      lookingFor: "",
      partnershipInterest: "",
      referralSource: "",
      referralSourceOther: "",
      privacyConsent: false,
    },
  })

  expect(response.status()).toBe(400)
  await expect(response.json()).resolves.toMatchObject({
    success: false,
  })
})

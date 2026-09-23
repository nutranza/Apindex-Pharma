import { expect, test } from "@playwright/test"

const WHATSAPP_URL = "https://wa.me/917698743840"

test("public layout exposes WhatsApp actions", async ({ page }) => {
  await page.goto("/")

  const headerLink = page.getByRole("link", {
    name: "Chat with Apindex on WhatsApp",
  })
  await expect(headerLink).toBeVisible()
  await expect(headerLink).toHaveAttribute("href", WHATSAPP_URL)
  await expect(headerLink).toHaveAttribute("target", "_blank")
  await expect(headerLink).toHaveAttribute("rel", "noopener noreferrer")

  const footerLink = page.getByRole("link", { name: "WhatsApp", exact: true })
  await expect(footerLink).toBeVisible()
  await expect(footerLink).toHaveAttribute("href", WHATSAPP_URL)
  await expect(footerLink).toHaveAttribute("target", "_blank")
  await expect(footerLink).toHaveAttribute("rel", "noopener noreferrer")

  await expect(page.getByRole("link", { name: "Open WhatsApp chat" })).toBeHidden()
})

test("mobile layout exposes a floating WhatsApp action", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/")

  const floatingLink = page.getByRole("link", { name: "Open WhatsApp chat" })
  await expect(floatingLink).toBeVisible()
  await expect(floatingLink).toHaveAttribute("href", WHATSAPP_URL)
  await expect(floatingLink).toHaveAttribute("target", "_blank")
  await expect(floatingLink).toHaveAttribute("rel", "noopener noreferrer")

  await page.getByRole("button", { name: "Open navigation menu" }).click()

  const mobileMenu = page
    .locator("#apindex-mobile-navigation")
  await expect(
    mobileMenu.getByRole("link", { name: "Chat with Apindex on WhatsApp" })
  ).toHaveCount(0)
})

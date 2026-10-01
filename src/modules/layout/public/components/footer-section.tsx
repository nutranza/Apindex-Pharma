import Image from "next/image"
import Link from "next/link"
import { MdCall, MdMail, MdLocationOn } from "react-icons/md"
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
  FaYoutube,
  FaWhatsapp,
} from "react-icons/fa6"
import { WHATSAPP_URL } from "@/modules/layout/public/constants"
import {
  COMPANY_ADDRESS_TEXT,
  COMPANY_DESCRIPTION,
} from "@modules/company/constants"

type NavLink = {
  label: string
  href: string
}

const COMPANY_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Products", href: "/products" },
  { label: "Blog", href: "/blog" },
  { label: "Contact Us", href: "/contact" },
]

const LEGAL_LINKS: NavLink[] = [
  { label: "Shipping Policy", href: "/shipping-policy" },
  { label: "Return Policy", href: "/return-policy" },
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Disclaimer", href: "/disclaimer" },
]

const SOCIAL_ICONS = [
  { label: "Facebook", icon: FaFacebookF },
  {
    label: "LinkedIn",
    icon: FaLinkedinIn,
    href: "https://www.linkedin.com/in/ashish-chovatiya-822732231/",
  },
  { label: "X", icon: FaXTwitter },
  { label: "Instagram", icon: FaInstagram },
  { label: "YouTube", icon: FaYoutube },
  { label: "WhatsApp", icon: FaWhatsapp, href: WHATSAPP_URL },
]

export default function FooterSection() {
  return (
    <footer className="apx-font-body text-on-surface pt-16 pb-7">
      <div className="content-container">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-20 xl:gap-28">
          <div className="max-w-xl">
            <Link
              href="/"
              aria-label="Apindex home"
              className="inline-flex focus-visible:outline-none"
            >
              <Image
                src="/apindex-logo.jpg"
                alt="Apindex Pharmaceuticals"
                width={1920}
                height={1187}
                quality={100}
                className="block h-24 w-auto object-contain sm:h-28"
              />
            </Link>

            <p className="mt-6 max-w-lg text-sm leading-7 text-on-surface-variant sm:text-base">
              {COMPANY_DESCRIPTION}
            </p>

            <div className="mt-6 space-y-2.5 text-sm leading-6 text-on-surface-variant">
              <FooterContactItem icon={MdLocationOn}>
                {COMPANY_ADDRESS_TEXT}
              </FooterContactItem>
              <FooterContactItem
                icon={MdMail}
                href="mailto:info@apindexpharma.com"
              >
                info@apindexpharma.com
              </FooterContactItem>
              <FooterContactItem icon={MdCall} href="tel:+917698743840">
                +91 7698743840
              </FooterContactItem>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              {SOCIAL_ICONS.map((item) => {
                const Icon = item.icon
                const iconClassName =
                  "inline-flex size-9 items-center justify-center rounded-md border border-outline-variant/35 text-base text-on-surface-variant transition-colors hover:border-primary-container hover:bg-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container"

                return item.href ? (
                  <a
                    key={item.label}
                    aria-label={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={iconClassName}
                  >
                    <Icon aria-hidden="true" />
                  </a>
                ) : (
                  <span
                    key={item.label}
                    aria-label={item.label}
                    role="img"
                    className={iconClassName}
                  >
                    <Icon aria-hidden="true" />
                  </span>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-12 lg:pt-2">
            <FooterLinkColumn title="Company" links={COMPANY_LINKS} />
            <FooterLinkColumn title="Policies" links={LEGAL_LINKS} />
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-5 border-t border-outline-variant/25 pt-6 text-center text-xs text-on-surface-variant sm:mt-16 sm:pt-7 lg:flex-row lg:items-center lg:justify-between lg:text-left">
          <p>
            &copy; {new Date().getFullYear()} Apindex Pharmaceuticals. All Rights
            Reserved.
          </p>

          <a
            href="https://apexture.in/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Managed by Apexture"
            className="inline-flex items-center justify-center gap-2 rounded-md transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container lg:justify-end"
          >
            <span>Managed by</span>
            <span className="inline-flex rounded bg-white px-2 py-1">
              <Image
                src="/apexture-logo.svg"
                alt="Apexture"
                width={112}
                height={22}
                className="h-5 w-auto"
              />
            </span>
          </a>
        </div>
      </div>
    </footer>
  )
}

function FooterContactItem({
  icon: Icon,
  href,
  children,
}: {
  icon: typeof MdLocationOn
  href?: string
  children: string
}) {
  const className =
    "flex max-w-sm items-start gap-3 transition-colors hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container"

  const content = (
    <>
      <Icon aria-hidden="true" className="mt-0.5 shrink-0 text-lg text-primary-container" />
      <span>{children}</span>
    </>
  )

  return href ? (
    <a href={href} className={className}>
      {content}
    </a>
  ) : (
    <div className={className}>{content}</div>
  )
}

function FooterLinkColumn({
  title,
  links,
}: {
  title: string
  links: NavLink[]
}) {
  return (
    <div>
      <h3 className="apx-font-headline text-sm font-semibold text-on-surface">
        {title}
      </h3>
      <ul className="mt-6 space-y-3.5">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-sm text-on-surface-variant transition-colors hover:text-primary-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

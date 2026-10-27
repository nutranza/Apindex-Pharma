import Image from "next/image"
import Link from "next/link"
import { MdCall, MdMail, MdLocationOn } from "react-icons/md"
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
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
  {
    label: "Instagram",
    icon: FaInstagram,
    href: "https://www.instagram.com/apindex.pharmaceutical/",
  },
  { label: "WhatsApp", icon: FaWhatsapp, href: WHATSAPP_URL },
]

export default function FooterSection() {
  return (
    <footer className="apx-font-body rounded-t-3xl bg-[#fff8ed] text-on-surface">
      <div className="content-container grid gap-10 py-10 sm:py-12 lg:grid-cols-[1.15fr_2fr] lg:gap-20 lg:py-14">
        <div>
          <Link
            href="/"
            aria-label="Apindex home"
            className="inline-flex w-fit shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-4 focus-visible:ring-offset-[#fff8ed]"
          >
            <Image
              src="/apindex-logo-registered.png"
              alt="Apindex Pharmaceuticals"
              width={1920}
              height={1187}
              sizes="128px"
              quality={90}
              className="block h-auto w-32 object-contain"
            />
          </Link>

          <p className="mt-4 max-w-sm text-sm leading-6 text-on-surface-variant">
            {COMPANY_DESCRIPTION}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {SOCIAL_ICONS.map((item) => {
              const Icon = item.icon
              const iconClassName =
                "inline-flex size-11 items-center justify-center rounded-full border border-outline-variant/40 bg-white/80 text-base text-on-surface-variant shadow-sm"

              return item.href ? (
                <a
                  key={item.label}
                  aria-label={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${iconClassName} transition-colors hover:border-on-secondary-container hover:bg-on-secondary-container hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-on-secondary-container focus-visible:ring-offset-2 focus-visible:ring-offset-[#fff8ed]`}
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

        <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-[0.7fr_1fr_1.35fr] lg:gap-x-8">
          <FooterLinkColumn title="Company" links={COMPANY_LINKS} />
          <FooterLinkColumn title="Policies" links={LEGAL_LINKS} />

          <div className="col-span-2 min-w-0 sm:col-span-1">
            <h3 className="apx-font-headline text-sm font-semibold text-on-surface">
              Get in touch
            </h3>
            <div className="mt-3 text-sm leading-6 text-on-surface-variant">
              <FooterContactItem icon={MdCall} href="tel:+917698743840">
                +91 7698743840
              </FooterContactItem>
              <FooterContactItem
                icon={MdMail}
                href="mailto:info@apindexpharma.com"
              >
                info@apindexpharma.com
              </FooterContactItem>
              <FooterContactItem icon={MdLocationOn}>
                {COMPANY_ADDRESS_TEXT}
              </FooterContactItem>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-outline-variant/35 bg-primary-fixed/70">
        <div className="content-container flex flex-col items-center gap-3 pb-24 pt-4 text-center text-xs leading-6 text-on-surface-variant sm:flex-row sm:justify-between sm:py-4 sm:text-left">
          <p>
            &copy; {new Date().getFullYear()} Apindex Pharmaceuticals. All
            Rights Reserved.
          </p>

          <a
            href="https://apexture.in/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Managed by Apexture"
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2.5 rounded-lg px-2 transition-colors hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
          >
            <span>Managed by</span>
            <span className="inline-flex">
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
  const className = "flex min-w-0 items-start gap-2.5 rounded-md py-2"

  const content = (
    <>
      <Icon
        aria-hidden="true"
        className="mt-1 size-4 shrink-0 text-on-surface-variant"
      />
      <span className="min-w-0 break-words">{children}</span>
    </>
  )

  return href ? (
    <a
      href={href}
      className={`${className} underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-[#fff8ed]`}
    >
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
    <nav aria-label={`Footer ${title.toLowerCase()}`}>
      <h3 className="apx-font-headline text-sm font-semibold text-on-surface">
        {title}
      </h3>
      <ul className="mt-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="inline-flex items-center rounded-md py-2 text-sm leading-6 text-on-surface-variant underline-offset-4 transition-colors hover:text-on-secondary-container hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-[#fff8ed]"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

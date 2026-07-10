import Image from "next/image"
import Link from "next/link"
import { MdCall, MdMail } from "react-icons/md"
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6"

type NavLink = {
  label: string
  href: string
}

const COMPANY_LINKS: NavLink[] = [
  { label: "About Us", href: "/about" },
  { label: "Certificates & Licenses", href: "/about#credentials" },
  { label: "Product Categories", href: "/#categories" },
  { label: "Manufacturing Capabilities", href: "/#infrastructure" },
  { label: "Global Presence", href: "/#global-presence" },
  { label: "Quality & R&D", href: "/#why-choose-us" },
]

const QUICK_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact Us", href: "/contact" },
  { label: "Latest Blog", href: "/#latest-blog" },
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
]

export default function FooterSection() {
  return (
    <footer className="apx-font-body border-t border-gray-200/60 bg-white text-on-surface">
      <div className="content-container">
        <div className="mt-10">
          <div className="grid gap-12 pb-10 lg:grid-cols-[1.2fr_0.7fr_0.7fr] lg:gap-16">
            <div className="max-w-md">
              <Image
                src="/apindex-logo.jpg"
                alt="Apindex"
                width={1920}
                height={1187}
                quality={100}
                className="h-16 w-auto object-contain"
              />

              <p className="mt-5 max-w-sm text-sm font-semibold leading-6 text-on-surface">
                WHO-GMP certified pharmaceutical manufacturing for global
                healthcare partners.
              </p>

              <div className="mt-5 space-y-3">
                <a
                  href="mailto:info@apindexpharma.com"
                  className="flex w-fit items-center gap-4 text-sm text-on-surface-variant transition-colors hover:text-primary"
                >
                  <MdMail aria-hidden="true" className="text-xl" />
                  <span>info@apindexpharma.com</span>
                </a>
                <a
                  href="tel:+912345678900"
                  className="flex w-fit items-center gap-4 text-sm text-on-surface-variant transition-colors hover:text-primary"
                >
                  <MdCall aria-hidden="true" className="text-xl" />
                  <span>+91 7698743840</span>
                </a>
              </div>

              <div className="mt-5 flex items-center gap-5">
                {SOCIAL_ICONS.map((item) => {
                  const Icon = item.icon
                  const iconContent = <Icon aria-hidden="true" />
                  const iconClassName =
                    "inline-flex size-9 items-center justify-center rounded-full bg-surface-high text-lg text-on-surface transition-colors hover:bg-primary hover:text-white"

                  return item.href ? (
                    <a
                      key={item.label}
                      aria-label={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={iconClassName}
                    >
                      {iconContent}
                    </a>
                  ) : (
                    <span
                      key={item.label}
                      aria-label={item.label}
                      role="img"
                      className={iconClassName}
                    >
                      {iconContent}
                    </span>
                  )
                })}
              </div>
            </div>

            <FooterLinkColumn title="Company" links={COMPANY_LINKS} />
            <FooterLinkColumn title="Quick Links" links={QUICK_LINKS} />
          </div>

          <div className="grid gap-4 border-t border-gray-200/80 py-6 text-center text-xs font-medium text-on-surface lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:text-left">
            <p className="lg:justify-self-start">
              &copy; {new Date().getFullYear()} Apindex Pharmaceuticals. All
              Rights Reserved.
            </p>

            <p className="text-xs font-semibold text-on-surface-variant lg:justify-self-center">
              Managed by{" "}
              <a
                href="https://apexture.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-on-surface underline underline-offset-2"
              >
                apexture.in
              </a>
            </p>

            <div className="flex justify-center gap-4 text-xs text-on-surface-variant lg:justify-self-end">
              <Link
                href="/privacy-policy"
                className="transition-colors hover:text-primary"
              >
                Privacy Policy
              </Link>
              <span className="text-on-surface">|</span>
              <Link
                href="/disclaimer"
                className="transition-colors hover:text-primary"
              >
                Disclaimer
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
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
      <h4 className="apx-font-headline text-base font-semibold text-on-surface">
        {title}
      </h4>
      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-sm text-on-surface-variant transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

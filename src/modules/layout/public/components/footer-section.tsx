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
  { label: "LinkedIn", icon: FaLinkedinIn },
  { label: "X", icon: FaXTwitter },
  { label: "Instagram", icon: FaInstagram },
  { label: "YouTube", icon: FaYoutube },
]

export default function FooterSection() {
  return (
    <footer className="apx-font-body border-t border-gray-200/60 bg-white text-on-surface">
      <div className="content-container">
        <div className="pt-12 lg:pt-14">
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
                  href="mailto:contact@apindexpharma.com"
                  className="flex w-fit items-center gap-4 text-sm text-on-surface-variant transition-colors hover:text-primary"
                >
                  <MdMail aria-hidden="true" className="text-xl" />
                  <span>contact@apindexpharma.com</span>
                </a>
                <a
                  href="tel:+912345678900"
                  className="flex w-fit items-center gap-4 text-sm text-on-surface-variant transition-colors hover:text-primary"
                >
                  <MdCall aria-hidden="true" className="text-xl" />
                  <span>+91 2345678900</span>
                </a>
              </div>

              <div className="mt-5 flex items-center gap-5">
                {SOCIAL_ICONS.map((item) => {
                  const Icon = item.icon
                  return (
                    <span
                      key={item.label}
                      aria-label={item.label}
                      role="img"
                      className="inline-flex text-xl text-on-surface transition-colors hover:text-primary"
                    >
                      <Icon aria-hidden="true" />
                    </span>
                  )
                })}
              </div>
            </div>

            <FooterLinkColumn title="Company" links={COMPANY_LINKS} />
            <FooterLinkColumn title="Quick Links" links={QUICK_LINKS} />
          </div>

          <div className="flex flex-col gap-4 border-t border-gray-200/80 py-6 text-sm font-medium text-on-surface sm:flex-row sm:items-center sm:justify-between">
            <p>
              &copy; {new Date().getFullYear()} Apindex Pharmaceuticals. All
              Rights Reserved.
            </p>
            <div className="flex gap-6 text-xs text-on-surface-variant">
              <span>Privacy Policy</span>
              <span>Disclaimer</span>
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
      <h4 className="apx-font-headline text-base font-extrabold text-on-surface">
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

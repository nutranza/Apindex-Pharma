"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  FolderIcon,
  RectangleStackIcon,
  TagIcon,
  UsersIcon,
} from "@heroicons/react/24/outline"
import { useHasPermission } from "@/lib/permissions/context"
import { PERMISSIONS, Permission } from "@/lib/permissions"

type NavItemConfig = {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  permission?: Permission
}

const NAV_ITEMS: NavItemConfig[] = [
  {
    label: "Products",
    href: "/admin/products",
    icon: TagIcon,
    permission: PERMISSIONS.PRODUCTS_READ,
  },
  {
    label: "Collections",
    href: "/admin/collections",
    icon: RectangleStackIcon,
    permission: PERMISSIONS.COLLECTIONS_READ,
  },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: FolderIcon,
    permission: PERMISSIONS.CATEGORIES_READ,
  },
  {
    label: "Team",
    href: "/admin/team",
    icon: UsersIcon,
    permission: PERMISSIONS.TEAM_MANAGE,
  },
]

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`)
}

type NavItemProps = {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  pathname: string
  onClick?: () => void
}

function NavItem({ label, href, icon: Icon, pathname, onClick }: NavItemProps) {
  const active = isActive(pathname, href)

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
        active
          ? "bg-gray-900 text-white shadow-sm"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      <Icon
        className={`h-5 w-5 shrink-0 transition-colors ${
          active ? "text-white" : "text-gray-400 group-hover:text-gray-600"
        }`}
      />
      <span className="flex-1">{label}</span>
    </Link>
  )
}

function ProtectedNavItem({
  item,
  pathname,
  onClick,
}: {
  item: NavItemConfig
  pathname: string
  onClick?: () => void
}) {
  const hasPermission = useHasPermission(item.permission || ("*" as Permission))

  if (item.permission && !hasPermission) {
    return null
  }

  return (
    <NavItem
      label={item.label}
      href={item.href}
      icon={item.icon}
      pathname={pathname}
      onClick={onClick}
    />
  )
}

export function AdminSidebarNav({
  onItemClick,
}: { onItemClick?: () => void } = {}) {
  const pathname = usePathname()

  return (
    <div className="space-y-6">
      <div>
        <p className="px-3 mb-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
          Store
        </p>
        <div className="space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <ProtectedNavItem
              key={item.href}
              item={item}
              pathname={pathname}
              onClick={onItemClick}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

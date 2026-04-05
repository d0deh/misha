'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Building2,
  Check,
  ChevronDown,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Menu,
  Users,
  Vote,
  Wrench,
  X,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useUser, canVote, canManageMaintenance } from '@/lib/user-context'
import { useAppData } from '@/lib/app-data-context'
import { getOwnerById, getRoleLabel, getBuildingData, getUserUnitIds } from '@/lib/mock-data'
import type { AssociationRoleType } from '@/lib/types'

const nonResidentRoles: AssociationRoleType[] = [
  'chairman',
  'vice_chairman',
  'board_member',
  'manager',
  'owner',
]

function getNavItems(buildingId: string) {
  return [
    { title: 'لوحة التحكم', href: `/buildings/${buildingId}`, icon: LayoutDashboard, mobileIcon: LayoutDashboard, description: 'نظرة عامة على عمليات المبنى', minRole: null },
    { title: 'القرارات', href: `/buildings/${buildingId}/decisions`, icon: Vote, mobileIcon: Vote, description: 'القرارات المفتوحة والمواعيد والنتائج', minRole: 'owner' as const },
    { title: 'الصيانة', href: `/buildings/${buildingId}/maintenance`, icon: Wrench, mobileIcon: ClipboardList, description: 'الطلبات والتقدم وقائمة الاستجابة', minRole: null },
    { title: 'الجمعية', href: `/buildings/${buildingId}/association`, icon: Users, mobileIcon: Users, description: 'أدوار الجمعية والملاك والرسوم', minRole: 'owner' as const },
    { title: 'المبنى والوحدات', href: `/buildings/${buildingId}/units`, icon: Building2, mobileIcon: Building2, description: 'الوحدات والإشغال وسجلات المبنى', minRole: null },
    { title: 'المستندات', href: `/buildings/${buildingId}/documents`, icon: FileText, mobileIcon: FileText, description: 'المستندات والسجلات والأرشيف', minRole: null },
  ]
}

export function Topbar({ buildingId }: { buildingId: string }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { userId, role, switchUser, switchableUsers } = useUser()
  const navItems = getNavItems(buildingId)
  const buildingData = getBuildingData(buildingId)
  const appData = useAppData()

  // Compute badge counts
  const badgeCounts: Record<string, number> = {}

  // القرارات: open decisions user hasn't voted on
  if (canVote(role)) {
    badgeCounts[`/buildings/${buildingId}/decisions`] = appData.getDecisionsAwaitingVote(userId).length
  }

  // الصيانة: role-based count
  if (canManageMaintenance(role)) {
    badgeCounts[`/buildings/${buildingId}/maintenance`] = appData.maintenanceRequests.filter(
      (r) => r.status === 'new' || (r.priority === 'urgent' && r.status !== 'completed' && r.status !== 'cancelled')
    ).length
  } else {
    badgeCounts[`/buildings/${buildingId}/maintenance`] = appData.maintenanceRequests.filter(
      (r) => r.requesterId === userId && (r.status === 'new' || r.status === 'in_progress')
    ).length
  }

  // المستندات: documents uploaded in last 7 days
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  badgeCounts[`/buildings/${buildingId}/documents`] = appData.documents.filter(
    (d) => new Date(d.createdAt).getTime() > sevenDaysAgo
  ).length

  const visibleNav = navItems.filter(
    (item) => item.minRole === null || nonResidentRoles.includes(role)
  )

  const activeItem =
    visibleNav.find((item) =>
      item.href === `/buildings/${buildingId}`
        ? pathname === item.href
        : pathname.startsWith(item.href)
    ) || visibleNav[0]

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-stone-200/70 bg-[rgba(247,244,238,0.88)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-900 text-sm font-bold text-white shadow-[0_12px_30px_rgba(28,25,23,0.18)]">
              م
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-stone-500">
                مركز قيادة مِشاع
              </p>
              <h1 className="truncate text-lg font-semibold text-stone-950 md:text-xl">
                {buildingData?.building.name || 'مِشاع'}
              </h1>
              <p className="truncate text-sm text-stone-600">
                {buildingData ? `${buildingData.building.unitCount} وحدة` : ''}
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            {visibleNav.map((item) => {
              const isActive =
                item.href === `/buildings/${buildingId}`
                  ? pathname === item.href
                  : pathname.startsWith(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'group rounded-2xl border px-4 py-3 transition-all',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500',
                    isActive
                      ? 'border-teal-200 bg-white text-stone-950 shadow-[0_14px_30px_rgba(15,118,110,0.08)]'
                      : 'border-transparent text-stone-600 hover:border-stone-200 hover:bg-white/80 hover:text-stone-900'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="relative">
                      <item.icon
                        className={cn(
                          'h-4 w-4',
                          isActive ? 'text-teal-700' : 'text-stone-500 group-hover:text-stone-700'
                        )}
                      />
                      <NavBadge count={badgeCounts[item.href] || 0} />
                    </span>
                    <span className="text-sm font-medium">{item.title}</span>
                  </div>
                  <p className="mt-1 text-xs text-stone-500">{item.description}</p>
                </Link>
              )
            })}
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800 transition-colors hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {getRoleLabel(role)}
                <ChevronDown className="h-3 w-3 text-emerald-700" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-64 p-2">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="px-3 py-1.5">تبديل المنظور</DropdownMenuLabel>
                  {switchableUsers.map((u) => {
                    const owner = getOwnerById(u.userId, buildingData?.owners)
                    const isActive = u.userId === userId

                    return (
                      <DropdownMenuItem
                        key={u.userId}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-md',
                          isActive && 'bg-teal-50'
                        )}
                        onClick={() => switchUser(u.userId)}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-stone-900">
                            {owner?.fullName.split(' ').slice(0, 3).join(' ')}
                          </p>
                          <p className="text-xs text-stone-500">{getRoleLabel(u.role)}</p>
                        </div>
                        {isActive && <Check className="h-4 w-4 shrink-0 text-teal-600" />}
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              className="inline-flex rounded-2xl border border-stone-200 bg-white p-2 text-stone-700 shadow-sm transition hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-4 md:px-6 lg:hidden">
          <div className="rounded-3xl border border-stone-200/80 bg-white/85 px-4 py-3 shadow-[0_18px_40px_rgba(28,25,23,0.06)]">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-500">
              <activeItem.icon className="h-3.5 w-3.5 text-teal-700" />
              {activeItem.title}
            </div>
            <p className="mt-1 text-sm text-stone-600">{activeItem.description}</p>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="sticky top-[109px] z-30 border-b border-stone-200/70 bg-[rgba(247,244,238,0.96)] px-4 py-3 backdrop-blur md:px-6 lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-2">
            {visibleNav.map((item) => {
              const isActive =
                item.href === `/buildings/${buildingId}`
                  ? pathname === item.href
                  : pathname.startsWith(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'rounded-2xl border px-4 py-3 transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500',
                    isActive
                      ? 'border-teal-200 bg-white text-stone-950'
                      : 'border-transparent bg-transparent text-stone-700 hover:border-stone-200 hover:bg-white'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="relative">
                      <item.icon className={cn('h-4 w-4', isActive ? 'text-teal-700' : 'text-stone-500')} />
                      <NavBadge count={badgeCounts[item.href] || 0} />
                    </span>
                    <span className="text-sm font-medium">{item.title}</span>
                  </div>
                  <p className="mt-1 text-xs text-stone-500">{item.description}</p>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-[rgba(255,255,255,0.92)] px-3 py-2 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-1">
          {visibleNav.map((item) => {
            const isActive =
              item.href === `/buildings/${buildingId}`
                ? pathname === item.href
                : pathname.startsWith(item.href)
            const MobileIcon = item.mobileIcon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-center transition-colors',
                  isActive
                    ? 'bg-teal-50 text-teal-800'
                    : 'text-stone-500 hover:bg-stone-100 hover:text-stone-800'
                )}
              >
                <span className="relative">
                  <MobileIcon className="h-4 w-4" />
                  <NavBadge count={badgeCounts[item.href] || 0} />
                </span>
                <span className="truncate text-xs font-medium">{item.title}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}

function NavBadge({ count }: { count: number }) {
  if (count === 0) return null
  return (
    <span className="absolute -top-1 -start-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
      {count}
    </span>
  )
}

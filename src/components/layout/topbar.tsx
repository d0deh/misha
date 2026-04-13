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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useUser, canManageMaintenance, canVote } from '@/lib/user-context'
import { useAppData } from '@/lib/app-data-context'
import { getBuildingData, getOwnerById, getRoleLabel } from '@/lib/mock-data'
import type { AssociationRoleType } from '@/lib/types'

const nonResidentRoles: AssociationRoleType[] = [
  'chairman',
  'vice_chairman',
  'board_member',
  'manager',
  'owner',
]

type NavItem = {
  title: string
  desktopLabel: string
  href: string
  icon: typeof LayoutDashboard
  mobileIcon: typeof LayoutDashboard
  description: string
  minRole: AssociationRoleType | null
}

function getNavItems(buildingId: string): NavItem[] {
  return [
    {
      title: 'لوحة التحكم',
      desktopLabel: 'لوحة التحكم',
      href: `/buildings/${buildingId}`,
      icon: LayoutDashboard,
      mobileIcon: LayoutDashboard,
      description: 'نظرة عامة على عمليات المبنى',
      minRole: null,
    },
    {
      title: 'القرارات',
      desktopLabel: 'القرارات',
      href: `/buildings/${buildingId}/decisions`,
      icon: Vote,
      mobileIcon: Vote,
      description: 'القرارات المفتوحة والمواعيد والنتائج',
      minRole: 'owner',
    },
    {
      title: 'الصيانة',
      desktopLabel: 'الصيانة',
      href: `/buildings/${buildingId}/maintenance`,
      icon: Wrench,
      mobileIcon: ClipboardList,
      description: 'الطلبات والتقدم وقائمة الاستجابة',
      minRole: null,
    },
    {
      title: 'الجمعية',
      desktopLabel: 'الجمعية',
      href: `/buildings/${buildingId}/association`,
      icon: Users,
      mobileIcon: Users,
      description: 'الأدوار والملاك والرسوم',
      minRole: 'owner',
    },
    {
      title: 'المبنى والوحدات',
      desktopLabel: 'الوحدات',
      href: `/buildings/${buildingId}/units`,
      icon: Building2,
      mobileIcon: Building2,
      description: 'الوحدات والإشغال وسجلات المبنى',
      minRole: null,
    },
    {
      title: 'المستندات',
      desktopLabel: 'المستندات',
      href: `/buildings/${buildingId}/documents`,
      icon: FileText,
      mobileIcon: FileText,
      description: 'المستندات والسجلات والأرشيف',
      minRole: null,
    },
  ]
}

export function Topbar({ buildingId }: { buildingId: string }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [renderedAt] = useState(() => Date.now())
  const pathname = usePathname()
  const { userId, role, switchUser, switchableUsers } = useUser()
  const navItems = getNavItems(buildingId)
  const buildingData = getBuildingData(buildingId)
  const appData = useAppData()

  const badgeCounts: Record<string, number> = {}

  if (canVote(role)) {
    badgeCounts[`/buildings/${buildingId}/decisions`] = appData.getDecisionsAwaitingVote(userId).length
  }

  if (canManageMaintenance(role)) {
    badgeCounts[`/buildings/${buildingId}/maintenance`] = appData.maintenanceRequests.filter(
      (request) =>
        request.status === 'new' ||
        (request.priority === 'urgent' &&
          request.status !== 'completed' &&
          request.status !== 'cancelled')
    ).length
  } else {
    badgeCounts[`/buildings/${buildingId}/maintenance`] = appData.maintenanceRequests.filter(
      (request) =>
        request.requesterId === userId &&
        (request.status === 'new' || request.status === 'in_progress')
    ).length
  }

  const sevenDaysAgo = renderedAt - 7 * 24 * 60 * 60 * 1000
  badgeCounts[`/buildings/${buildingId}/documents`] = appData.documents.filter(
    (document) => new Date(document.createdAt).getTime() > sevenDaysAgo
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
      <header className="sticky top-0 z-40 border-b border-black/8 bg-shell text-shell-foreground shadow-[0_12px_36px_rgba(8,21,24,0.16)]">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="flex items-start justify-between gap-4 py-4 md:gap-6">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/12 bg-white/10 text-base font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                م
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-shell-muted">مركز قيادة مشاع</p>
                <TooltipProvider delay={150}>
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <span
                          className="mt-1 block max-w-[min(100%,30rem)] cursor-default overflow-hidden text-[1.35rem] leading-tight font-semibold text-shell-foreground [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] md:text-[1.55rem]"
                          title={buildingData?.building.name}
                        />
                      }
                    >
                      {buildingData?.building.name || 'مِشاع'}
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      align="end"
                      className="max-w-[min(80vw,28rem)] whitespace-normal bg-stone-950 text-stone-50"
                    >
                      {buildingData?.building.name || 'مِشاع'}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <p className="mt-1 text-sm text-shell-muted">
                  {buildingData ? `${buildingData.building.unitCount} وحدة` : ''}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex h-10 items-center gap-2 rounded-full border border-white/14 bg-white/8 px-3 text-sm font-medium text-shell-foreground transition-colors hover:bg-white/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="hidden sm:inline">{getRoleLabel(role)}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-shell-muted" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-64 p-2">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="px-3 py-1.5">تبديل المنظور</DropdownMenuLabel>
                    {switchableUsers.map((user) => {
                      const owner = getOwnerById(user.userId, buildingData?.owners)
                      const isActive = user.userId === userId

                      return (
                        <DropdownMenuItem
                          key={user.userId}
                          className={cn(
                            'flex items-center gap-3 rounded-xl px-3 py-2.5',
                            isActive && 'bg-muted/70'
                          )}
                          onClick={() => switchUser(user.userId)}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground">
                              {owner?.fullName.split(' ').slice(0, 3).join(' ')}
                            </p>
                            <p className="text-xs text-muted-foreground">{getRoleLabel(user.role)}</p>
                          </div>
                          {isActive && <Check className="h-4 w-4 shrink-0 text-primary" />}
                        </DropdownMenuItem>
                      )
                    })}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <button
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/14 bg-white/8 text-shell-foreground transition hover:bg-white/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 lg:hidden"
                onClick={() => setMobileMenuOpen((open) => !open)}
                aria-label={mobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="hidden border-t border-white/10 py-3 lg:block">
            <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <nav className="flex min-w-max items-stretch gap-2" aria-label="تنقل المبنى">
                {visibleNav.map((item) => {
                  const isActive =
                    item.href === `/buildings/${buildingId}`
                      ? pathname === item.href
                      : pathname.startsWith(item.href)

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'group relative flex h-12 shrink-0 items-center gap-3 rounded-2xl border px-3.5 py-2 text-start transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30',
                        isActive
                          ? 'border-white/14 bg-white/12 text-shell-foreground'
                          : 'border-transparent text-shell-muted hover:bg-white/7 hover:text-shell-foreground'
                      )}
                    >
                      <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 text-shell-foreground">
                        <item.icon className="h-4 w-4" />
                        <NavBadge count={badgeCounts[item.href] || 0} ringClassName="ring-shell" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">{item.desktopLabel}</span>
                        {isActive && (
                          <span className="hidden max-w-[14rem] truncate text-xs text-shell-muted xl:block">
                            {item.description}
                          </span>
                        )}
                      </span>
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>

          <div className="border-t border-white/8 py-3 lg:hidden">
            <div className="rounded-[1.35rem] border border-white/12 bg-white/7 px-4 py-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-shell-muted">
                <activeItem.icon className="h-3.5 w-3.5 text-shell-foreground" />
                {activeItem.title}
              </div>
              <p className="mt-1 text-sm text-shell-foreground/88">{activeItem.description}</p>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="border-t border-white/10 py-3 lg:hidden">
              <div className="flex flex-col gap-2">
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
                        'rounded-[1.2rem] border px-4 py-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30',
                        isActive
                          ? 'border-white/15 bg-white/12 text-shell-foreground'
                          : 'border-transparent bg-white/6 text-shell-foreground/88 hover:bg-white/10'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
                          <item.icon className="h-4 w-4" />
                          <NavBadge count={badgeCounts[item.href] || 0} ringClassName="ring-shell" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium">{item.title}</p>
                          <p className="mt-0.5 text-xs text-shell-muted">{item.description}</p>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-[rgba(255,253,250,0.94)] px-3 py-2 shadow-[0_-10px_30px_rgba(43,36,28,0.08)] backdrop-blur lg:hidden">
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
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                )}
              >
                <span className="relative flex h-11 w-11 items-center justify-center rounded-xl">
                  <MobileIcon className="h-4 w-4" />
                  <NavBadge count={badgeCounts[item.href] || 0} ringClassName="ring-card" />
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

function NavBadge({
  count,
  ringClassName,
}: {
  count: number
  ringClassName: string
}) {
  if (count === 0) return null

  return (
    <span
      className={cn(
        'pointer-events-none absolute inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[11px] font-semibold leading-none text-destructive-foreground ring-2',
        ringClassName
      )}
      style={{ insetInlineEnd: '-0.35rem', insetBlockStart: '-0.35rem' }}
      aria-label={`${count} إشعارات`}
    >
      {count > 99 ? '99+' : count}
    </span>
  )
}

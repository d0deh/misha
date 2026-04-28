'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LayoutGrid,
  MoreHorizontal,
  Users,
  Vote,
  Wrench,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { MishaLogo } from '@/components/brand/misha-logo'
import { cn } from '@/lib/utils'
import { useUser, canManageMaintenance, canVote } from '@/lib/user-context'
import { useAppData } from '@/lib/app-data-context'
import { getBuildingData, getOwnerById, getRoleLabel } from '@/lib/mock-data'
import type { AssociationRoleType, Owner } from '@/lib/types'

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
      description: 'التصويت والنتائج',
      minRole: 'owner',
    },
    {
      title: 'الصيانة',
      desktopLabel: 'الصيانة',
      href: `/buildings/${buildingId}/maintenance`,
      icon: Wrench,
      mobileIcon: ClipboardList,
      description: 'الطلبات والمتابعة',
      minRole: null,
    },
    {
      title: 'الجمعية',
      desktopLabel: 'الجمعية',
      href: `/buildings/${buildingId}/association`,
      icon: Users,
      mobileIcon: Users,
      description: 'الأدوار والملاك',
      minRole: 'owner',
    },
    {
      title: 'الوحدات',
      desktopLabel: 'الوحدات',
      href: `/buildings/${buildingId}/units`,
      icon: LayoutGrid,
      mobileIcon: LayoutGrid,
      description: 'المبنى والإشغال',
      minRole: null,
    },
    {
      title: 'المستندات',
      desktopLabel: 'المستندات',
      href: `/buildings/${buildingId}/documents`,
      icon: FileText,
      mobileIcon: FileText,
      description: 'الأرشيف والسجلات',
      minRole: null,
    },
  ]
}

export function AppShell({
  buildingId,
  children,
}: {
  buildingId: string
  children: React.ReactNode
}) {
  const [moreSheetOpen, setMoreSheetOpen] = useState(false)
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
  const primaryNav = visibleNav.slice(0, 3)
  const moreNav = visibleNav.slice(3)
  const moreHasBadge = moreNav.some((item) => (badgeCounts[item.href] || 0) > 0)
  const moreIsActive = moreNav.some((item) => pathname.startsWith(item.href))

  return (
    <div className="min-h-screen bg-background text-foreground lg:ps-72">
      <aside className="fixed inset-y-0 start-0 z-40 hidden w-72 border-e border-white/10 bg-shell text-shell-foreground lg:flex lg:flex-col">
        <div className="px-5 pb-5 pt-6">
          <MishaLogo tone="light" markSize={42} />
        </div>

        <div className="mx-4 rounded-2xl border border-white/10 bg-white/7 p-4">
          <p className="text-xs font-medium text-shell-muted">مساحة العمل</p>
          <TooltipProvider delay={150}>
            <Tooltip>
              <TooltipTrigger
                render={
                  <span
                    className="mt-2 block cursor-default overflow-hidden text-lg font-medium leading-7 text-white [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]"
                    title={buildingData?.building.name}
                    tabIndex={0}
                  />
                }
              >
                {buildingData?.building.name || 'مِشاع'}
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                align="start"
                className="max-w-[18rem] whitespace-normal bg-white text-primary"
              >
                {buildingData?.building.name || 'مِشاع'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <p className="mt-2 text-sm text-shell-muted">
            {buildingData ? `${buildingData.building.unitCount} وحدة` : ''}
          </p>
        </div>

        <nav className="mt-5 flex-1 space-y-1.5 px-3" aria-label="تنقل المبنى">
          {visibleNav.map((item) => (
            <SidebarNavLink
              key={item.href}
              item={item}
              badge={badgeCounts[item.href] || 0}
              isActive={
                item.href === `/buildings/${buildingId}`
                  ? pathname === item.href
                  : pathname.startsWith(item.href)
              }
            />
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <RoleSwitcher
            role={role}
            userId={userId}
            switchUser={switchUser}
            switchableUsers={switchableUsers}
            owners={buildingData?.owners}
          />
        </div>
      </aside>

      <header className="sticky top-0 z-30 border-b border-border bg-card/96 px-4 py-3 shadow-[0_1px_2px_rgba(28,28,28,0.03)] lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <MishaLogo showEnglish={false} compact markSize={28} />
          <div className="flex min-w-0 items-center gap-3">
            <div className="min-w-0 text-end">
              <p className="truncate text-sm font-medium text-foreground">
                {buildingData?.building.name || 'مِشاع'}
              </p>
              <p className="text-xs text-muted-foreground">
                {buildingData ? `${buildingData.building.unitCount} وحدة` : ''}
              </p>
            </div>
            <RoleSwitcher
              compact
              role={role}
              userId={userId}
              switchUser={switchUser}
              switchableUsers={switchableUsers}
              owners={buildingData?.owners}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 pb-28 pt-5 md:px-6 md:pb-10 md:pt-6 lg:px-8 lg:pt-8">
        {children}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/96 px-3 py-2 shadow-[0_-1px_2px_rgba(28,28,28,0.04)] lg:hidden">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-1">
          {primaryNav.map((item) => {
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
                  'flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45',
                  isActive
                    ? 'bg-primary/8 text-primary'
                    : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                )}
              >
                <span className="relative flex h-10 w-10 items-center justify-center rounded-xl">
                  <MobileIcon className="h-5 w-5" />
                  <NavBadge count={badgeCounts[item.href] || 0} ringClassName="ring-card" edge="end" />
                </span>
                <span className="text-[11px] font-medium">
                  {item.title === 'لوحة التحكم' ? 'الرئيسية' : item.title}
                </span>
              </Link>
            )
          })}
          <button
            type="button"
            onClick={() => setMoreSheetOpen(true)}
            className={cn(
              'flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45',
              moreIsActive
                ? 'bg-primary/8 text-primary'
                : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
            )}
          >
            <span className="relative flex h-10 w-10 items-center justify-center rounded-xl">
              <MoreHorizontal className="h-5 w-5" />
              {moreHasBadge && (
                <span
                  className="pointer-events-none absolute h-2.5 w-2.5 rounded-full bg-destructive ring-2 ring-card"
                  style={{ insetInlineEnd: '0.35rem', insetBlockStart: '0.35rem' }}
                />
              )}
            </span>
            <span className="text-[11px] font-medium">المزيد</span>
          </button>
        </div>
      </nav>

      <Sheet open={moreSheetOpen} onOpenChange={setMoreSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl px-0 pb-8 pt-0">
          <div className="flex justify-center py-3">
            <div className="h-1 w-8 rounded-full bg-border" />
          </div>
          <nav className="space-y-1 px-4">
            {moreNav.map((item) => {
              const isActive = pathname.startsWith(item.href)
              const badge = badgeCounts[item.href] || 0
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreSheetOpen(false)}
                  className={cn(
                    'flex items-center gap-3.5 rounded-xl px-4 py-3.5 transition-colors',
                    isActive ? 'bg-primary/8 text-primary' : 'text-foreground hover:bg-muted/70'
                  )}
                >
                  <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/70">
                    <item.icon className="h-5 w-5" />
                    <NavBadge count={badge} ringClassName="ring-card" edge="start" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <ChevronLeft className="h-4 w-4 shrink-0 text-muted-foreground" />
                </Link>
              )
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  )
}

function SidebarNavLink({
  item,
  isActive,
  badge,
}: {
  item: NavItem
  isActive: boolean
  badge: number
}) {
  return (
    <Link
      href={item.href}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'group flex min-h-11 items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring/60',
        isActive
          ? 'border-white/12 bg-white/10 text-white'
          : 'border-transparent text-shell-muted hover:bg-white/7 hover:text-white'
      )}
    >
      <span
        className={cn(
          'relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
          isActive ? 'bg-white/12 text-white' : 'text-shell-muted group-hover:text-white'
        )}
      >
        <item.icon className="h-4 w-4" />
        <NavBadge count={badge} ringClassName="ring-shell" edge="start" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{item.desktopLabel}</span>
        {isActive && (
          <span className="mt-0.5 block truncate text-xs text-shell-muted">
            {item.description}
          </span>
        )}
      </span>
    </Link>
  )
}

function RoleSwitcher({
  role,
  userId,
  switchUser,
  switchableUsers,
  owners,
  compact = false,
}: {
  role: AssociationRoleType
  userId: string
  switchUser: (userId: string) => void
  switchableUsers: { userId: string; role: AssociationRoleType }[]
  owners: Owner[] | undefined
  compact?: boolean
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'inline-flex h-10 items-center gap-2 rounded-full border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2',
          compact
            ? 'border-border bg-card px-2.5 text-foreground hover:bg-muted/70 focus-visible:ring-ring/45'
            : 'w-full justify-between border-white/12 bg-white/7 px-3 text-white hover:bg-white/10 focus-visible:ring-sidebar-ring/60'
        )}
      >
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-accent" />
          {!compact && <span>{getRoleLabel(role)}</span>}
        </span>
        <ChevronDown className={cn('h-3.5 w-3.5', compact ? 'text-muted-foreground' : 'text-shell-muted')} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-64 p-2">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-3 py-1.5">تبديل المنظور</DropdownMenuLabel>
          {switchableUsers.map((user) => {
            const owner = getOwnerById(user.userId, owners)
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
  )
}

function NavBadge({
  count,
  ringClassName,
  edge = 'start',
}: {
  count: number
  ringClassName: string
  edge?: 'start' | 'end'
}) {
  if (count === 0) return null

  return (
    <span
      className={cn(
        'pointer-events-none absolute inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[11px] font-medium leading-none text-destructive-foreground ring-2',
        ringClassName
      )}
      style={{
        [edge === 'start' ? 'insetInlineStart' : 'insetInlineEnd']: '-0.35rem',
        insetBlockStart: '-0.35rem',
      }}
      aria-label={`${count > 99 ? '99+' : count} إشعارات`}
    >
      {count > 99 ? '99+' : count}
    </span>
  )
}

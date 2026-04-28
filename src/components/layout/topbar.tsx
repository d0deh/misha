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
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet'
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
      title: 'Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ…',
      desktopLabel: 'Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ…',
      href: `/buildings/${buildingId}`,
      icon: LayoutDashboard,
      mobileIcon: LayoutDashboard,
      description: 'Ù†Ø¸Ø±Ø© Ø¹Ø§Ù…Ø© Ø¹Ù„Ù‰ Ø¹Ù…Ù„ÙŠØ§Øª Ø§Ù„Ù…Ø¨Ù†Ù‰',
      minRole: null,
    },
    {
      title: 'Ø§Ù„Ù‚Ø±Ø§Ø±Ø§Øª',
      desktopLabel: 'Ø§Ù„Ù‚Ø±Ø§Ø±Ø§Øª',
      href: `/buildings/${buildingId}/decisions`,
      icon: Vote,
      mobileIcon: Vote,
      description: 'Ø§Ù„Ù‚Ø±Ø§Ø±Ø§Øª Ø§Ù„Ù…ÙØªÙˆØ­Ø© ÙˆØ§Ù„Ù…ÙˆØ§Ø¹ÙŠØ¯ ÙˆØ§Ù„Ù†ØªØ§Ø¦Ø¬',
      minRole: 'owner',
    },
    {
      title: 'Ø§Ù„ØµÙŠØ§Ù†Ø©',
      desktopLabel: 'Ø§Ù„ØµÙŠØ§Ù†Ø©',
      href: `/buildings/${buildingId}/maintenance`,
      icon: Wrench,
      mobileIcon: ClipboardList,
      description: 'Ø§Ù„Ø·Ù„Ø¨Ø§Øª ÙˆØ§Ù„ØªÙ‚Ø¯Ù… ÙˆÙ‚Ø§Ø¦Ù…Ø© Ø§Ù„Ø§Ø³ØªØ¬Ø§Ø¨Ø©',
      minRole: null,
    },
    {
      title: 'Ø§Ù„Ø¬Ù…Ø¹ÙŠØ©',
      desktopLabel: 'Ø§Ù„Ø¬Ù…Ø¹ÙŠØ©',
      href: `/buildings/${buildingId}/association`,
      icon: Users,
      mobileIcon: Users,
      description: 'Ø§Ù„Ø£Ø¯ÙˆØ§Ø± ÙˆØ§Ù„Ù…Ù„Ø§Ùƒ ÙˆØ§Ù„Ø±Ø³ÙˆÙ…',
      minRole: 'owner',
    },
    {
      title: 'Ø§Ù„Ù…Ø¨Ù†Ù‰ ÙˆØ§Ù„ÙˆØ­Ø¯Ø§Øª',
      desktopLabel: 'Ø§Ù„ÙˆØ­Ø¯Ø§Øª',
      href: `/buildings/${buildingId}/units`,
      icon: LayoutGrid,
      mobileIcon: LayoutGrid,
      description: 'Ø§Ù„ÙˆØ­Ø¯Ø§Øª ÙˆØ§Ù„Ø¥Ø´ØºØ§Ù„ ÙˆØ³Ø¬Ù„Ø§Øª Ø§Ù„Ù…Ø¨Ù†Ù‰',
      minRole: null,
    },
    {
      title: 'Ø§Ù„Ù…Ø³ØªÙ†Ø¯Ø§Øª',
      desktopLabel: 'Ø§Ù„Ù…Ø³ØªÙ†Ø¯Ø§Øª',
      href: `/buildings/${buildingId}/documents`,
      icon: FileText,
      mobileIcon: FileText,
      description: 'Ø§Ù„Ù…Ø³ØªÙ†Ø¯Ø§Øª ÙˆØ§Ù„Ø³Ø¬Ù„Ø§Øª ÙˆØ§Ù„Ø£Ø±Ø´ÙŠÙ',
      minRole: null,
    },
  ]
}

export function Topbar({ buildingId }: { buildingId: string }) {
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

  // Primary bottom nav: dashboard, decisions, maintenance
  const primaryNav = visibleNav.slice(0, 3)
  // "More" sheet: association, units, documents
  const moreNav = visibleNav.slice(3)
  const moreHasBadge = moreNav.some((item) => (badgeCounts[item.href] || 0) > 0)
  const moreIsActive = moreNav.some((item) => pathname.startsWith(item.href))

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-black/8 bg-shell text-shell-foreground shadow-[0_12px_36px_rgba(15,23,42,0.16)]">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="flex items-start justify-between gap-4 py-4 md:gap-6">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/12 bg-white/10 text-base font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] md:h-12 md:w-12">
                Ù…
              </div>
              <div className="min-w-0 flex-1">
                <p className="hidden text-xs font-medium text-shell-muted md:block">Ù…Ø±ÙƒØ² Ù‚ÙŠØ§Ø¯Ø© Ù…Ø´Ø§Ø¹</p>
                <TooltipProvider delay={150}>
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <span
                          className="mt-1 block max-w-[min(100%,30rem)] cursor-default overflow-hidden text-[1.35rem] leading-tight font-medium text-shell-foreground [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] md:text-[1.55rem]"
                          title={buildingData?.building.name}
                        />
                      }
                    >
                      {buildingData?.building.name || 'Ù…ÙØ´Ø§Ø¹'}
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      align="end"
                      className="max-w-[min(80vw,28rem)] whitespace-normal bg-foreground text-background"
                    >
                      {buildingData?.building.name || 'Ù…ÙØ´Ø§Ø¹'}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <p className="mt-1 text-sm text-shell-muted">
                  {buildingData ? `${buildingData.building.unitCount} ÙˆØ­Ø¯Ø©` : ''}
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
                    <DropdownMenuLabel className="px-3 py-1.5">ØªØ¨Ø¯ÙŠÙ„ Ø§Ù„Ù…Ù†Ø¸ÙˆØ±</DropdownMenuLabel>
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

            </div>
          </div>

          <div className="hidden border-t border-white/10 py-3 lg:block">
            <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <nav className="flex min-w-max items-stretch gap-2" aria-label="ØªÙ†Ù‚Ù„ Ø§Ù„Ù…Ø¨Ù†Ù‰">
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

        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-[rgba(248,249,251,0.94)] px-3 py-2 shadow-[0_-10px_30px_rgba(15,23,42,0.06)] backdrop-blur lg:hidden">
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
                  'flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-center transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                )}
              >
                <span className="relative flex h-11 w-11 items-center justify-center rounded-xl">
                  <MobileIcon className="h-5 w-5" />
                  <NavBadge count={badgeCounts[item.href] || 0} ringClassName="ring-card" />
                </span>
                <span className="text-[11px] font-medium">{item.title === 'Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ…' ? 'Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©' : item.title}</span>
              </Link>
            )
          })}
          <button
            onClick={() => setMoreSheetOpen(true)}
            className={cn(
              'flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-center transition-colors',
              moreIsActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
            )}
          >
            <span className="relative flex h-11 w-11 items-center justify-center rounded-xl">
              <MoreHorizontal className="h-5 w-5" />
              {moreHasBadge && (
                <span
                  className="pointer-events-none absolute h-2.5 w-2.5 rounded-full bg-destructive ring-2 ring-card"
                  style={{ insetInlineEnd: '0.35rem', insetBlockStart: '0.35rem' }}
                />
              )}
            </span>
            <span className="text-[11px] font-medium">Ø§Ù„Ù…Ø²ÙŠØ¯</span>
          </button>
        </div>
      </nav>

      {/* "More" bottom sheet */}
      <Sheet open={moreSheetOpen} onOpenChange={setMoreSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-[1.5rem] px-0 pb-8 pt-0">
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
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/70">
                    <item.icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  {badge > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[11px] font-medium text-destructive-foreground">
                      {badge}
                    </span>
                  )}
                  <ChevronLeft className="h-4 w-4 shrink-0 text-muted-foreground" />
                </Link>
              )
            })}
          </nav>
        </SheetContent>
      </Sheet>
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
        'pointer-events-none absolute inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[11px] font-medium leading-none text-destructive-foreground ring-2',
        ringClassName
      )}
      style={{ insetInlineEnd: '-0.35rem', insetBlockStart: '-0.35rem' }}
      aria-label={`${count} Ø¥Ø´Ø¹Ø§Ø±Ø§Øª`}
    >
      {count > 99 ? '99+' : count}
    </span>
  )
}

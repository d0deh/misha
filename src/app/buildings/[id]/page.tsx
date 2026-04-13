'use client'

import Link from 'next/link'
import {
  Building2,
  ChevronLeft,
  CircleAlert,
  FileText,
  Vote,
  Wrench,
} from 'lucide-react'
import {
  PageHeader,
  PageHeaderBody,
  PageHeaderDescription,
  PageHeaderEyebrow,
  PageHeaderTitle,
} from '@/components/ui/page-header'
import {
  getCategoryLabel,
  getOwnerById,
  getOwnerRole,
  getOwnerUnits,
  getPriorityLabel,
  getRoleLabel,
  getUserUnitIds,
  getVoteOptionLabel,
} from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { categoryBadge, categoryBorder } from './decisions/_constants'
import { statusStyles as maintenanceStatusStyles } from './maintenance/_constants'
import { useUser, canVote } from '@/lib/user-context'
import { useAppData } from '@/lib/app-data-context'
import { formatRelativeTime } from '@/lib/relative-time'
import { getVotedAreaWeight } from '@/lib/vote-weights'

const actionDotColor: Record<string, string> = {
  create: 'bg-success',
  vote: 'bg-primary',
  update: 'bg-warning',
  upload: 'bg-muted-foreground',
}


const summaryToneStyles = {
  decisions: 'border-primary/10 bg-primary/10 text-primary',
  maintenance: 'border-warning/15 bg-warning/10 text-warning',
  units: 'border-info/15 bg-info/10 text-info',
  activity: 'border-border/70 bg-muted/55 text-muted-foreground',
} as const

const signalToneStyles = {
  default: 'border-border/70 bg-muted/55 text-foreground',
  primary: 'border-primary/10 bg-primary/8 text-primary',
  warning: 'border-warning/15 bg-warning/8 text-warning',
} as const

export default function DashboardPage() {
  const { userId, role, userName } = useUser()
  const {
    building,
    owners,
    units,
    ownershipLinks,
    associationRoles,
    decisions,
    maintenanceRequests,
    activityLog,
    getDecisionVotes,
    getUserVoteForDecision,
    getDecisionsAwaitingVote,
    voterWeights,
  } = useAppData()

  const isAdmin = ['chairman', 'vice_chairman'].includes(role)
  const isManager = role === 'manager'
  const userCanVote = canVote(role)

  const occupiedUnits = units.filter((unit) => unit.occupancyStatus !== 'vacant').length
  const occupancyRate = Math.round((occupiedUnits / units.length) * 100)
  const openDecisions = decisions.filter((decision) => decision.status === 'open')
  const activeMaintenanceCount = maintenanceRequests.filter(
    (request) => request.status === 'new' || request.status === 'in_progress'
  ).length
  const urgentMaintenance = maintenanceRequests.filter(
    (request) =>
      request.priority === 'urgent' &&
      (request.status === 'new' || request.status === 'in_progress')
  )
  const recentActivity = activityLog.slice(0, 8)
  const today = new Date()

  const userUnitIds = getUserUnitIds(userId, ownershipLinks)
  const awaitingVote = getDecisionsAwaitingVote(userId)
  const userMaintenanceOpen = maintenanceRequests.filter(
    (request) =>
      (request.status === 'new' || request.status === 'in_progress') &&
      (request.requesterId === userId ||
        (request.unitId !== undefined && userUnitIds.includes(request.unitId)))
  )

  const attentionItems: { text: string; href: string }[] = []

  if (isAdmin) {
    if (urgentMaintenance.length > 0) {
      attentionItems.push({ text: `${urgentMaintenance.length} طلب صيانة عاجل`, href: `/buildings/${building.id}/maintenance` })
    }
    if (openDecisions.length > 0) {
      attentionItems.push({ text: `${openDecisions.length} قرار مفتوح بانتظار إجراء`, href: `/buildings/${building.id}/decisions` })
    }
  } else if (isManager) {
    const pendingMaintenance = maintenanceRequests.filter(
      (request) => request.status === 'new' || request.status === 'in_progress'
    ).length
    if (pendingMaintenance > 0) {
      attentionItems.push({ text: `${pendingMaintenance} طلب صيانة يحتاج متابعة`, href: `/buildings/${building.id}/maintenance` })
    }
  } else {
    if (awaitingVote.length > 0) {
      attentionItems.push({ text: `${awaitingVote.length} قرار بانتظار تصويتك`, href: `/buildings/${building.id}/decisions` })
    }
    if (userMaintenanceOpen.length > 0) {
      attentionItems.push({ text: `${userMaintenanceOpen.length} طلب صيانة مفتوح على وحداتك`, href: `/buildings/${building.id}/maintenance` })
    }
  }

  const displayDecisions = (() => {
    if (isAdmin || isManager) return openDecisions
    const awaiting = new Set(awaitingVote.map((decision) => decision.id))
    return [...openDecisions].sort((a, b) => {
      const aAwaiting = awaiting.has(a.id) ? 0 : 1
      const bAwaiting = awaiting.has(b.id) ? 0 : 1
      return aAwaiting - bAwaiting
    })
  })()

  const commandCards = [
    {
      title: 'تصويتات مفتوحة',
      value: openDecisions.length,
      hint: userCanVote ? `${awaitingVote.length} بانتظار ردك` : 'تابع سير القرارات',
      href: `/buildings/${building.id}/decisions`,
      icon: Vote,
      tone: 'decisions' as const,
    },
    {
      title: 'صيانة نشطة',
      value: activeMaintenanceCount,
      hint:
        urgentMaintenance.length > 0
          ? `${urgentMaintenance.length} مصنف عاجل`
          : 'لا توجد طلبات عاجلة حالياً',
      href: `/buildings/${building.id}/maintenance`,
      icon: Wrench,
      tone: 'maintenance' as const,
    },
    {
      title: 'وحدات مشغولة',
      value: occupiedUnits,
      hint: `نسبة الإشغال ${occupancyRate}٪`,
      href: `/buildings/${building.id}/units`,
      icon: Building2,
      tone: 'units' as const,
    },
    {
      title: 'سجل النشاط',
      value: activityLog.length,
      hint: 'الأحداث والتغييرات والعمليات',
      href: `/buildings/${building.id}/documents`,
      icon: FileText,
      tone: 'activity' as const,
    },
  ]

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'صباح الخير' : 'مساء الخير'
  const firstName = userName.split(' ')[0]
  const hijriDate = new Intl.DateTimeFormat('ar-SA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    calendar: 'islamic-umalqura',
  }).format(new Date())

  return (
    <div className="space-y-6">
      <PageHeader className="gap-3">
        <PageHeaderBody>
          <PageHeaderEyebrow>لوحة القيادة اليومية</PageHeaderEyebrow>
          <PageHeaderTitle className="text-[1.55rem] md:text-[1.85rem]">
            {greeting} {firstName}
          </PageHeaderTitle>
          <PageHeaderDescription>{hijriDate}</PageHeaderDescription>
        </PageHeaderBody>

        {attentionItems.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-[1.15rem] border border-warning/20 bg-warning/8 px-3 py-2.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-warning/25 bg-card/92 px-2.5 py-1 text-sm font-semibold text-warning">
              <CircleAlert className="h-4 w-4 shrink-0" />
              <span>يحتاج انتباهك</span>
            </div>
            <ul className="flex flex-wrap gap-2 ps-0">
              {attentionItems.map((item) => (
                <li key={item.text} className="list-none">
                  <Link
                    href={item.href}
                    className="rounded-full border border-warning/12 bg-card/72 px-2.5 py-1 text-sm text-foreground transition-colors hover:bg-card hover:border-warning/25"
                  >
                    {item.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </PageHeader>

      {/* Compact stat pills — mobile */}
      <div className="flex gap-3 md:hidden">
        <Link
          href={`/buildings/${building.id}/decisions`}
          className="flex flex-1 items-center gap-2.5 rounded-xl border border-border/80 bg-card px-3.5 py-3 transition-colors hover:bg-primary/4"
        >
          <Vote className="h-4 w-4 shrink-0 text-primary" />
          <span className="text-lg font-semibold tabular-nums text-foreground">{openDecisions.length}</span>
          <span className="text-xs text-muted-foreground">قرار مفتوح</span>
        </Link>
        <Link
          href={`/buildings/${building.id}/maintenance`}
          className="flex flex-1 items-center gap-2.5 rounded-xl border border-border/80 bg-card px-3.5 py-3 transition-colors hover:bg-primary/4"
        >
          <Wrench className="h-4 w-4 shrink-0 text-warning" />
          <span className="text-lg font-semibold tabular-nums text-foreground">{activeMaintenanceCount}</span>
          <span className="text-xs text-muted-foreground">صيانة نشطة</span>
        </Link>
      </div>

      {/* Full metric cards — desktop */}
      <div className="hidden gap-4 md:grid md:grid-cols-2 xl:grid-cols-4">
        {commandCards.map((card) => (
          <Link key={card.title} href={card.href} className="metric-card group">
            <div className="min-w-0">
              <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
              <p className="mt-2 text-[2rem] font-semibold leading-none tabular-nums text-foreground">
                {card.value}
              </p>
            </div>
            <span className={cn('metric-card-icon', summaryToneStyles[card.tone])}>
              <card.icon className="h-[18px] w-[18px]" />
            </span>
            <p className="metric-card-hint col-span-full">{card.hint}</p>
            <span className="col-span-full flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
              عرض التفاصيل
              <ChevronLeft className="h-3.5 w-3.5" />
            </span>
          </Link>
        ))}
      </div>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="page-shell p-5 md:p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="section-heading-kicker">غرفة القرارات</p>
              <h2 className="mt-2 text-2xl font-semibold text-foreground">
                القرارات التي تحرك المبنى
              </h2>
            </div>
            <Link href={`/buildings/${building.id}/decisions`} className="section-heading-link">
              فتح مساحة التصويت
            </Link>
          </div>

          <div className="mt-5 space-y-4">
            {displayDecisions.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-border bg-muted/45 px-5 py-8 text-center">
                <Vote className="mx-auto h-11 w-11 text-muted-foreground/55" />
                <p className="mt-4 text-base font-medium text-foreground">لا توجد قرارات مفتوحة</p>
              </div>
            ) : (
              displayDecisions.map((decision) => {
                const decisionVotes = getDecisionVotes(decision.id)
                const deadline = new Date(decision.votingDeadline)
                const daysLeft = Math.ceil(
                  (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
                )
                const userVote = getUserVoteForDecision(userId, decision.id)
                const votedAreaWeight = getVotedAreaWeight(decisionVotes, voterWeights)
                const voteProgress = Math.round(votedAreaWeight)

                return (
                  <div
                    key={decision.id}
                    className={cn(
                      'rounded-[1.45rem] border border-border/80 bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.025)]',
                      categoryBorder[decision.category] || 'border-s-border',
                      'border-s-[4px]'
                    )}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="max-w-2xl">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={cn(
                              'status-pill',
                              categoryBadge[decision.category] || categoryBadge.general
                            )}
                          >
                            {getCategoryLabel(decision.category)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {daysLeft > 0 ? `${daysLeft} يوم متبقي` : 'انتهت المهلة'}
                          </span>
                        </div>
                        <h3 className="mt-3 text-lg font-semibold text-foreground">{decision.title}</h3>
                        <p className="mt-2 text-sm leading-7 text-muted-foreground">
                          {decision.description}
                        </p>
                      </div>
                      <div className="min-w-40 rounded-[1.2rem] border border-border/70 bg-muted/45 px-4 py-3">
                        <p className="text-xs text-muted-foreground">التقدم</p>
                        <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">
                          {voteProgress}٪
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {decisionVotes.length} ملاك يمثلون {Math.round(votedAreaWeight)}٪
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted/80">
                      <div
                        className="ms-auto h-full rounded-full bg-primary transition-all"
                        style={{ width: `${voteProgress}%` }}
                      />
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                      {userCanVote && !userVote && (
                        <span className="status-pill border-warning/20 bg-warning/10 text-warning">
                          لم تصوّت بعد
                        </span>
                      )}
                      {userCanVote && userVote && (
                        <span className="status-pill border-success/20 bg-success/10 text-success">
                          صوّتت: {getVoteOptionLabel(userVote.option)}
                        </span>
                      )}
                      <span className="text-muted-foreground">
                        أنشأه{' '}
                        {getOwnerById(decision.createdBy, owners)?.fullName
                          .split(' ')
                          .slice(0, 2)
                          .join(' ') || 'مجهول'}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="page-shell p-5 md:p-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="section-heading-kicker">طلبات الصيانة</p>
                <h2 className="mt-2 text-2xl font-semibold text-foreground">
                  الطلبات التي تحتاج متابعة
                </h2>
              </div>
              <Link href={`/buildings/${building.id}/maintenance`} className="section-heading-link">
                إدارة الطلبات
              </Link>
            </div>

            <div className="mt-5 space-y-3">
              {maintenanceRequests
                .filter((request) => request.status === 'new' || request.status === 'in_progress')
                .slice(0, 4)
                .map((request) => (
                  <div
                    key={request.id}
                    className="rounded-[1.3rem] border border-border/75 bg-muted/35 px-4 py-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-base font-medium text-foreground">{request.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {request.unitId
                            ? `الوحدة ${units.find((unit) => unit.id === request.unitId)?.unitNumber || ''}`
                            : 'المرافق المشتركة'}
                        </p>
                      </div>
                      {(() => {
                        const statusStyle =
                          maintenanceStatusStyles[request.status] || maintenanceStatusStyles.new
                        return (
                          <span className={cn('status-pill shrink-0', statusStyle.badge)}>
                            <span className={cn('h-1.5 w-1.5 rounded-full', statusStyle.dot)} />
                            {request.status === 'new' ? 'جديد' : 'قيد التنفيذ'}
                          </span>
                        )
                      })()}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span>{getPriorityLabel(request.priority)}</span>
                      <span>·</span>
                      <span>
                        {getOwnerById(request.requesterId, owners)?.fullName
                          .split(' ')
                          .slice(0, 2)
                          .join(' ')}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="hidden page-shell p-5 xl:block md:p-6">
            <p className="section-heading-kicker">مؤشرات المبنى</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <SignalTile
                label="إجمالي الوحدات"
                value={building.unitCount}
                note="مسجلة في سجل المبنى"
                tone="default"
              />
              <SignalTile
                label="الإشغال"
                value={`${occupancyRate}٪`}
                note={`${occupiedUnits} وحدة مشغولة حالياً`}
                tone="primary"
              />
              <SignalTile
                label="طلبات مفتوحة"
                value={activeMaintenanceCount}
                note="صيانة جديدة أو قيد التنفيذ"
                tone="warning"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="page-shell p-5 md:p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="section-heading-kicker">آخر النشاط</p>
              <h2 className="mt-2 text-2xl font-semibold text-foreground">آخر التحديثات</h2>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            {recentActivity.map((activity, activityIndex) => {
              const actor = getOwnerById(activity.actorId, owners)
              const actorName = actor?.fullName.split(' ').slice(0, 2).join(' ') || 'مجهول'
              const description = activity.descriptionAr
                .replace(actor?.fullName || '', '')
                .replace(/^[\s—–-]+/, '')
              const dotColor = actionDotColor[activity.action] || 'bg-muted-foreground'

              return (
                <div key={activity.id} className={cn('grid grid-cols-[auto_1fr] gap-4', activityIndex >= 4 && 'hidden md:grid')}>
                  <div className="flex flex-col items-center">
                    <span className={cn('mt-1 h-3 w-3 rounded-full', dotColor)} />
                    <span className="mt-2 h-full w-px bg-border" />
                  </div>
                  <div className="pb-5">
                    <p className="text-sm leading-7 text-muted-foreground">
                      <span className="font-semibold text-foreground">{actorName}</span>{' '}
                      {description}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatRelativeTime(activity.timestamp)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="hidden page-shell p-5 md:block md:p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="section-heading-kicker">لمحة عن الأعضاء</p>
              <h2 className="mt-2 text-2xl font-semibold text-foreground">
                الملاك والأدوار والتمثيل
              </h2>
            </div>
            <Link href={`/buildings/${building.id}/association`} className="section-heading-link">
              فتح سجل الجمعية
            </Link>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {owners.slice(0, 6).map((owner) => {
              const ownerUnits = getOwnerUnits(owner.id, ownershipLinks, units)
              const ownerRole = getOwnerRole(owner.id, associationRoles)

              return (
                <div
                  key={owner.id}
                  className="rounded-[1.3rem] border border-border/80 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-medium text-foreground">{owner.fullName}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {ownerRole ? getRoleLabel(ownerRole.role) : 'مالك'}
                      </p>
                    </div>
                    <div className="rounded-full border border-border/70 bg-muted/55 px-3 py-1 text-xs font-medium text-foreground">
                      {ownerUnits.length} وحدة
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {ownerUnits.map((unit) => unit.unitNumber).join('، ')}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}

function SignalTile({
  label,
  value,
  note,
  tone = 'default',
}: {
  label: string
  value: string | number
  note: string
  tone?: keyof typeof signalToneStyles
}) {
  return (
    <div className={cn('rounded-[1.25rem] border px-3.5 py-3', signalToneStyles[tone])}>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1.5 text-[1.7rem] font-semibold leading-none tabular-nums text-foreground">
        {value}
      </p>
      <p className="mt-1.5 text-sm text-muted-foreground">{note}</p>
    </div>
  )
}

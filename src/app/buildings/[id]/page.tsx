'use client'

import Link from 'next/link'
import {
  Building2,
  CircleAlert,
  FileText,
  Vote,
  Wrench,
} from 'lucide-react'
import {
  getCategoryLabel,
  getOwnerById,
  getOwnerRole,
  getOwnerUnits,
  getPriorityLabel,
  getUserUnitIds,
  getRoleLabel,
  getVoteOptionLabel,
} from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { useUser, canVote } from '@/lib/user-context'
import { useAppData } from '@/lib/app-data-context'
import { formatRelativeTime } from '@/lib/relative-time'
import { getVotedAreaWeight } from '@/lib/vote-weights'

const actionDotColor: Record<string, string> = {
  create: 'bg-emerald-500',
  vote: 'bg-teal-500',
  update: 'bg-amber-500',
  upload: 'bg-stone-400',
}

const maintenanceStatusStyles: Record<string, { dot: string; badge: string }> = {
  new: { dot: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  in_progress: { dot: 'bg-teal-500', badge: 'bg-teal-50 text-teal-700 border-teal-200' },
}

const categoryBadge: Record<string, string> = {
  financial: 'bg-amber-50 text-amber-700 border-amber-200',
  maintenance: 'bg-teal-50 text-teal-700 border-teal-200',
  governance: 'bg-violet-50 text-violet-700 border-violet-200',
  general: 'bg-stone-100 text-stone-600 border-stone-200',
}

const categoryBorder: Record<string, string> = {
  financial: 'border-s-amber-400',
  maintenance: 'border-s-teal-400',
  governance: 'border-s-violet-400',
  general: 'border-s-stone-300',
}

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

  const occupiedUnits = units.filter((u) => u.occupancyStatus !== 'vacant').length
  const occupancyRate = Math.round((occupiedUnits / units.length) * 100)
  const openDecisions = decisions.filter((d) => d.status === 'open')
  const activeMaintenanceCount = maintenanceRequests.filter(
    (r) => r.status === 'new' || r.status === 'in_progress'
  ).length
  const urgentMaintenance = maintenanceRequests.filter(
    (r) => r.priority === 'urgent' && (r.status === 'new' || r.status === 'in_progress')
  )
  const recentActivity = activityLog.slice(0, 8)
  const today = new Date()

  const userUnitIds = getUserUnitIds(userId, ownershipLinks)
  const awaitingVote = getDecisionsAwaitingVote(userId)
  const userMaintenanceOpen = maintenanceRequests.filter(
    (r) =>
      (r.status === 'new' || r.status === 'in_progress') &&
      (r.requesterId === userId || (r.unitId !== undefined && userUnitIds.includes(r.unitId)))
  )

  const attentionItems: string[] = []

  if (isAdmin) {
    if (urgentMaintenance.length > 0) {
      attentionItems.push(`${urgentMaintenance.length} طلب صيانة عاجل`)
    }
    if (openDecisions.length > 0) {
      attentionItems.push(`${openDecisions.length} قرار مفتوح بانتظار إجراء`)
    }
  } else if (isManager) {
    const pendingMaintenance = maintenanceRequests.filter(
      (r) => r.status === 'new' || r.status === 'in_progress'
    ).length
    if (pendingMaintenance > 0) {
      attentionItems.push(`${pendingMaintenance} طلب صيانة يحتاج متابعة`)
    }
  } else {
    if (awaitingVote.length > 0) {
      attentionItems.push(`${awaitingVote.length} قرار بانتظار تصويتك`)
    }
    if (userMaintenanceOpen.length > 0) {
      attentionItems.push(`${userMaintenanceOpen.length} طلب صيانة مفتوح على وحداتك`)
    }
  }

  const displayDecisions = (() => {
    if (isAdmin || isManager) return openDecisions
    const awaiting = new Set(awaitingVote.map((d) => d.id))
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
    },
    {
      title: 'صيانة نشطة',
      value: activeMaintenanceCount,
      hint: urgentMaintenance.length > 0 ? `${urgentMaintenance.length} مصنّف عاجل` : 'لا توجد طلبات عاجلة حالياً',
      href: `/buildings/${building.id}/maintenance`,
      icon: Wrench,
    },
    {
      title: 'وحدات مشغولة',
      value: occupiedUnits,
      hint: `نسبة الإشغال ${occupancyRate}٪`,
      href: `/buildings/${building.id}/units`,
      icon: Building2,
    },
    {
      title: 'سجل النشاط',
      value: activityLog.length,
      hint: 'الأحداث والتغييرات والعمليات',
      href: `/buildings/${building.id}/documents`,
      icon: FileText,
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
      <div>
        <p className="text-lg font-semibold text-stone-900">{greeting} {firstName}</p>
        <p className="text-sm text-stone-500">{hijriDate}</p>
      </div>

      {attentionItems.length > 0 && (
        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/75 px-3.5 py-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/90 bg-white/85 px-2.5 py-1 text-sm font-semibold text-amber-900 shadow-[0_1px_0_rgba(245,158,11,0.14)]">
            <CircleAlert className="h-4 w-4 shrink-0 text-amber-700" />
            <span>يحتاج انتباهك</span>
          </div>
          <ul className="mt-2 flex flex-wrap gap-2 ps-0">
            {attentionItems.map((item) => (
              <li key={item} className="list-none rounded-full bg-amber-100/70 px-2.5 py-1 text-sm text-amber-800">{item}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {commandCards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="group rounded-2xl border border-stone-200/90 bg-white/92 px-4 py-3.5 transition-colors hover:border-stone-300 hover:bg-white"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium text-stone-500">{card.title}</p>
                <p className="mt-1.5 text-[1.7rem] font-semibold tabular-nums leading-none text-stone-950">
                  {card.value}
                </p>
              </div>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-stone-100 text-stone-500 transition-colors group-hover:bg-stone-200/80 group-hover:text-stone-700">
                <card.icon className="h-[18px] w-[18px]" />
              </span>
            </div>
            <p className="mt-2 min-h-10 overflow-hidden text-xs leading-5 text-stone-600 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">{card.hint}</p>
          </Link>
        ))}
      </div>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[1.75rem] border border-stone-200/80 bg-white/90 p-5 shadow-[0_18px_50px_rgba(28,25,23,0.05)] md:p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-stone-500">
                غرفة القرارات
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-stone-950">
                القرارات التي تحرّك المبنى
              </h2>
            </div>
            <Link
              href={`/buildings/${building.id}/decisions`}
              className="text-sm font-medium text-teal-800 transition hover:text-teal-950"
            >
              فتح مساحة التصويت
            </Link>
          </div>

          <div className="mt-5 space-y-4">
            {displayDecisions.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-stone-300 bg-stone-50 px-5 py-8 text-center">
                <Vote className="mx-auto h-11 w-11 text-stone-300" />
                <p className="mt-4 text-base font-medium text-stone-700">لا توجد قرارات مفتوحة</p>
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
                      'rounded-[1.5rem] border border-stone-200 bg-[linear-gradient(180deg,_#ffffff_0%,_#fcfbf8_100%)] p-5',
                      categoryBorder[decision.category] || 'border-s-stone-300',
                      'border-s-[4px]'
                    )}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="max-w-2xl">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={cn(
                              'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium',
                              categoryBadge[decision.category] || categoryBadge.general
                            )}
                          >
                            {getCategoryLabel(decision.category)}
                          </span>
                          <span className="text-xs text-stone-500">
                            {daysLeft > 0 ? `${daysLeft} يوم متبقي` : 'انتهت المهلة'}
                          </span>
                        </div>
                        <h3 className="mt-3 text-lg font-semibold text-stone-950">{decision.title}</h3>
                        <p className="mt-2 text-sm leading-7 text-stone-600">{decision.description}</p>
                      </div>
                      <div className="min-w-40 rounded-2xl bg-stone-100 px-4 py-3">
                        <p className="text-xs text-stone-500">التقدم</p>
                        <p className="mt-2 text-2xl font-semibold tabular-nums text-stone-950">
                          {voteProgress}٪
                        </p>
                        <p className="mt-1 text-xs text-stone-500">
                          {decisionVotes.length} ملاك يمثلون {Math.round(votedAreaWeight)}٪
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-stone-100">
                      <div
                        className="h-full rounded-full bg-teal-600 transition-all ms-auto"
                        style={{ width: `${voteProgress}%` }}
                      />
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                      {userCanVote && !userVote && (
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-800">
                          لم تصوّت بعد
                        </span>
                      )}
                      {userCanVote && userVote && (
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-800">
                          صوّتت: {getVoteOptionLabel(userVote.option)}
                        </span>
                      )}
                      <span className="text-stone-500">
                        أنشأه{' '}
                        {getOwnerById(decision.createdBy, owners)?.fullName.split(' ').slice(0, 2).join(' ') ||
                          'مجهول'}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[1.75rem] border border-stone-200/80 bg-white/90 p-5 shadow-[0_18px_50px_rgba(28,25,23,0.05)] md:p-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-stone-500">
                  طلبات الصيانة
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-stone-950">
                  الطلبات التي تحتاج متابعة
                </h2>
              </div>
              <Link
                href={`/buildings/${building.id}/maintenance`}
                className="text-sm font-medium text-teal-800 transition hover:text-teal-950"
              >
                إدارة الطلبات
              </Link>
            </div>

            <div className="mt-5 space-y-3">
              {maintenanceRequests
                .filter((r) => r.status === 'new' || r.status === 'in_progress')
                .slice(0, 4)
                .map((request) => (
                  <div
                    key={request.id}
                    className="rounded-[1.35rem] border border-stone-200 bg-stone-50/80 px-4 py-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-base font-medium text-stone-900">{request.title}</p>
                        <p className="mt-1 text-sm text-stone-600">
                          {request.unitId
                            ? `الوحدة ${units.find((u) => u.id === request.unitId)?.unitNumber || ''}`
                            : 'المرافق المشتركة'}
                        </p>
                      </div>
                      {(() => {
                        const sStyle = maintenanceStatusStyles[request.status] || maintenanceStatusStyles.new
                        return (
                          <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium shrink-0', sStyle.badge)}>
                            <span className={cn('h-1.5 w-1.5 rounded-full', sStyle.dot)} />
                            {request.status === 'new' ? 'جديد' : 'قيد التنفيذ'}
                          </span>
                        )
                      })()}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-stone-500">
                      <span>{getPriorityLabel(request.priority)}</span>
                      <span>·</span>
                      <span>{getOwnerById(request.requesterId, owners)?.fullName.split(' ').slice(0, 2).join(' ')}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-stone-200/80 bg-white/90 p-5 shadow-[0_18px_50px_rgba(28,25,23,0.05)] md:p-6">
            <p className="text-xs font-semibold text-stone-500">
              مؤشرات المبنى
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <SignalTile label="إجمالي الوحدات" value={building.unitCount} note="مسجلة في سجل المبنى" />
              <SignalTile label="الإشغال" value={`${occupancyRate}٪`} note={`${occupiedUnits} وحدة مشغولة حالياً`} />
              <SignalTile label="طلبات مفتوحة" value={activeMaintenanceCount} note="صيانة جديدة أو قيد التنفيذ" />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-[1.75rem] border border-stone-200/80 bg-white/90 p-5 shadow-[0_18px_50px_rgba(28,25,23,0.05)] md:p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-stone-500">
                سجل النشاط
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-stone-950">
                آخر التحديثات
              </h2>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            {recentActivity.map((activity) => {
              const actor = getOwnerById(activity.actorId, owners)
              const actorName =
                actor?.fullName.split(' ').slice(0, 2).join(' ') || 'مجهول'
              const description = activity.descriptionAr
                .replace(actor?.fullName || '', '')
                .replace(/^[\sâ€”â€“-]+/, '')
              const dotColor = actionDotColor[activity.action] || 'bg-stone-400'

              return (
                <div key={activity.id} className="grid grid-cols-[auto_1fr] gap-4">
                  <div className="flex flex-col items-center">
                    <span className={cn('mt-1 h-3 w-3 rounded-full', dotColor)} />
                    <span className="mt-2 h-full w-px bg-stone-200" />
                  </div>
                  <div className="pb-5">
                    <p className="text-sm leading-7 text-stone-700">
                      <span className="font-semibold text-stone-950">{actorName}</span>{' '}
                      {description}
                    </p>
                    <p className="mt-1 text-xs text-stone-500">
                      {formatRelativeTime(activity.timestamp)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-stone-200/80 bg-white/90 p-5 shadow-[0_18px_50px_rgba(28,25,23,0.05)] md:p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-stone-500">
                لمحة عن الأعضاء
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-stone-950">
                الملاك والأدوار والتمثيل
              </h2>
            </div>
            <Link
              href={`/buildings/${building.id}/association`}
              className="text-sm font-medium text-teal-800 transition hover:text-teal-950"
            >
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
                  className="rounded-[1.35rem] border border-stone-200 bg-[linear-gradient(180deg,_#ffffff_0%,_#faf8f3_100%)] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-medium text-stone-900">{owner.fullName}</p>
                      <p className="mt-1 text-sm text-stone-600">
                        {ownerRole ? getRoleLabel(ownerRole.role) : 'مالك'}
                      </p>
                    </div>
                    <div className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700">
                      {ownerUnits.length} وحدة
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-stone-500">
                    {ownerUnits.map((unit) => unit.unitNumber).join(', ')}
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
}: {
  label: string
  value: string | number
  note: string
}) {
  return (
    <div className="rounded-[1.25rem] border border-stone-200 bg-stone-50/75 px-3.5 py-3">
      <p className="text-xs font-medium text-stone-500">{label}</p>
      <p className="mt-1.5 text-[1.7rem] font-semibold tabular-nums leading-none text-stone-950">{value}</p>
      <p className="mt-1.5 text-sm text-stone-600">{note}</p>
    </div>
  )
}

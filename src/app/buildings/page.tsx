import Link from 'next/link'
import type { ComponentType } from 'react'
import { Building2, ChevronLeft, Users, Vote, Wrench } from 'lucide-react'
import { buildings, getBuildingData } from '@/lib/mock-data'

export default function BuildingsPage() {
  const isEmpty = buildings.length === 0

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-8 md:px-6 md:py-12">
        <header className="page-header-block mb-6 md:mb-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-shell text-lg font-semibold text-shell-foreground shadow-[0_12px_30px_rgba(18,63,69,0.16)]">
                م
              </div>
              <p className="section-heading-kicker">منصة مِشاع</p>
              <h1 className="mt-2 text-[2.15rem] font-semibold leading-tight text-foreground md:text-[2.75rem]">
                اختر المبنى الذي تريد إدارته
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground md:text-base">
                مساحة عمل واحدة لجمعيات الملاك: القرارات، الصيانة، الرسوم، الوحدات، والمستندات.
              </p>
            </div>

            <div className="rounded-2xl border border-border/80 bg-muted/45 px-4 py-3 text-sm text-muted-foreground">
              <span className="font-semibold tabular-nums text-foreground">{buildings.length}</span>{' '}
              مبانٍ مرتبطة بالحساب التجريبي
            </div>
          </div>
        </header>

        {isEmpty ? (
          <BuildingsEmptyState />
        ) : (
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {buildings.map((building) => {
              const data = getBuildingData(building.id)
              if (!data) return null

              const occupiedUnits = data.units.filter((unit) => unit.occupancyStatus !== 'vacant').length
              const occupancyRate = Math.round((occupiedUnits / data.units.length) * 100)
              const openDecisions = data.decisions.filter((decision) => decision.status === 'open').length
              const activeMaintenance = data.maintenanceRequests.filter(
                (request) => request.status === 'new' || request.status === 'in_progress'
              ).length

              return (
                <Link
                  key={building.id}
                  href={`/buildings/${building.id}`}
                  className="group page-shell flex min-h-64 flex-col justify-between p-5 transition-colors hover:border-primary/25 hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/55"
                >
                  <div>
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/10 bg-primary/8 text-primary">
                        <Building2 className="h-5 w-5" />
                      </span>
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                        فتح اللوحة
                        <ChevronLeft className="h-4 w-4" />
                      </span>
                    </div>

                    <h2 className="line-clamp-2 text-xl font-semibold leading-snug text-foreground">
                      {building.name}
                    </h2>
                    <p className="mt-2 text-sm tabular-nums text-muted-foreground" dir="ltr">
                      {building.nationalAddress}
                    </p>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-2">
                    <Stat icon={Building2} label="وحدة" value={building.unitCount} />
                    <Stat icon={Users} label={`إشغال ${occupancyRate}%`} value={occupiedUnits} />
                    <Stat icon={Vote} label="قرار مفتوح" value={openDecisions} />
                    <Stat icon={Wrench} label="صيانة نشطة" value={activeMaintenance} />
                  </div>
                </Link>
              )
            })}
          </section>
        )}
      </div>
    </main>
  )
}

function BuildingsEmptyState() {
  return (
    <section className="page-shell mx-auto mt-4 max-w-xl px-6 py-14 text-center md:px-10 md:py-16">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-primary/10 bg-primary/8 text-primary">
        <Building2 className="h-7 w-7" />
      </div>
      <h2 className="mt-6 text-2xl font-semibold text-foreground">ابدأ بإدارة أول مبنى</h2>
      <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-muted-foreground">
        لم يتم ربط أي مبنى بحسابك بعد. لإضافة مبنى، تواصل مع فريق الدعم وسنهيئ لك مساحة الإدارة.
      </p>
      <a
        href="mailto:support@mishaa.sa"
        className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/55"
      >
        تواصل مع الدعم
      </a>
      <p className="mt-3 text-xs tabular-nums text-muted-foreground" dir="ltr">
        support@mishaa.sa
      </p>
    </section>
  )
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  value: number
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-muted/35 px-3 py-2.5">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-xs">{label}</span>
      </div>
      <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  )
}

import Link from 'next/link'
import type { ComponentType } from 'react'
import { ChevronLeft, LayoutGrid, Users, Vote, Wrench } from 'lucide-react'
import { MishaLogo, MishaMark } from '@/components/brand/misha-logo'
import { buildings, getBuildingData } from '@/lib/mock-data'

export default function BuildingsPage() {
  const isEmpty = buildings.length === 0

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-8 md:px-6 md:py-12">
        <header className="mb-6 rounded-3xl border border-border bg-card p-5 shadow-[0_1px_2px_rgba(28,28,28,0.03)] md:mb-8 md:p-7">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <MishaLogo markSize={44} />
              <p className="mt-8 text-xs font-medium text-muted-foreground">منصة مِشاع</p>
              <h1 className="mt-3 text-[2.1rem] font-medium leading-tight text-foreground md:text-[2.75rem]">
                اختر مساحة العمل
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground md:text-base">
                لوحة واحدة للقرارات والصيانة والوحدات والمستندات، مصممة لإدارة الملكيات المشتركة بهدوء ووضوح.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-muted/45 px-4 py-3 text-sm text-muted-foreground">
              <span className="font-medium tabular-nums text-foreground">{buildings.length}</span>{' '}
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
                  className="group page-shell flex min-h-64 flex-col justify-between p-5 transition-colors hover:border-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45"
                >
                  <div>
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border bg-muted/45 text-primary">
                        <MishaMark size={24} tone="brand" />
                      </span>
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                        فتح اللوحة
                        <ChevronLeft className="h-4 w-4" />
                      </span>
                    </div>

                    <h2 className="line-clamp-2 text-xl font-medium leading-snug text-foreground">
                      {building.name}
                    </h2>
                    <p className="mt-2 text-sm tabular-nums text-muted-foreground" dir="ltr">
                      {building.nationalAddress}
                    </p>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-2">
                    <Stat icon={LayoutGrid} label="وحدة" value={building.unitCount} />
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
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-border bg-muted/45 text-primary">
        <MishaMark size={34} tone="brand" />
      </div>
      <h2 className="mt-6 text-2xl font-medium text-foreground">ابدأ بإدارة أول مبنى</h2>
      <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-muted-foreground">
        لم يتم ربط أي مبنى بحسابك بعد. لإضافة مبنى، تواصل مع فريق الدعم وسنهيئ لك مساحة الإدارة.
      </p>
      <a
        href="mailto:support@mishaa.sa"
        className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45"
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
    <div className="rounded-xl border border-border bg-muted/35 px-3 py-2.5">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-xs">{label}</span>
      </div>
      <p className="mt-1 text-lg font-medium tabular-nums text-foreground">{value}</p>
    </div>
  )
}

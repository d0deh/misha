'use client'

import Link from 'next/link'
import { Building2, Vote, Wrench, Users } from 'lucide-react'
import { buildings, getBuildingData } from '@/lib/mock-data'

export default function BuildingsPage() {
  const isEmpty = buildings.length === 0

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-10 md:px-6 md:py-16">
        <div className="mb-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sm font-bold text-white mb-4">
            م
          </div>
          <h1 className="text-3xl font-semibold text-slate-950">مِشاع</h1>
          <p className="mt-2 text-sm text-slate-600">
            {isEmpty ? 'لا توجد مباني مرتبطة بحسابك بعد' : 'اختر المبنى الذي تريد إدارته'}
          </p>
        </div>

        {isEmpty ? (
          <BuildingsEmptyState />
        ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {buildings.map((b) => {
            const data = getBuildingData(b.id)
            if (!data) return null

            const occupiedUnits = data.units.filter((u) => u.occupancyStatus !== 'vacant').length
            const occupancyRate = Math.round((occupiedUnits / data.units.length) * 100)
            const openDecisions = data.decisions.filter((d) => d.status === 'open').length
            const activeMaintenance = data.maintenanceRequests.filter(
              (r) => r.status === 'new' || r.status === 'in_progress'
            ).length

            return (
              <Link
                key={b.id}
                href={`/buildings/${b.id}`}
                className="group rounded-lg border border-slate-200 bg-white p-5 transition-colors hover:border-teal-300 hover:bg-teal-50/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 group-hover:text-teal-800">
                      {b.name}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500" dir="ltr">
                      {b.nationalAddress}
                    </p>
                  </div>
                  <Building2 className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-teal-600" />
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <Stat icon={Building2} label="وحدة" value={b.unitCount} />
                  <Stat icon={Users} label={`إشغال ${occupancyRate}٪`} value={occupiedUnits} />
                  <Stat icon={Vote} label="قرار مفتوح" value={openDecisions} />
                  <Stat icon={Wrench} label="صيانة نشطة" value={activeMaintenance} />
                </div>
              </Link>
            )
          })}
        </div>
        )}
      </div>
    </div>
  )
}

function BuildingsEmptyState() {
  return (
    <section
      className="relative mx-auto mt-4 max-w-xl overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white px-6 py-14 text-center md:px-10 md:py-20"
      aria-live="polite"
    >
      {/* faint blueprint grid, does not demand attention */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgb(226 232 240) 1px, transparent 1px), linear-gradient(to bottom, rgb(226 232 240) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          maskImage:
            'radial-gradient(circle at center, black 0%, black 45%, transparent 75%)',
          WebkitMaskImage:
            'radial-gradient(circle at center, black 0%, black 45%, transparent 75%)',
        }}
      />

      <div className="relative flex flex-col items-center gap-6">
        {/* Architectural facade — thin stone strokes, one filled window, one teal dot */}
        <svg
          viewBox="0 0 120 140"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          className="h-28 w-auto text-slate-400"
          aria-hidden
        >
          {/* top accent */}
          <circle cx="60" cy="12" r="2" fill="#0d9488" stroke="none" />
          {/* cornice */}
          <line x1="16" y1="22" x2="104" y2="22" />
          {/* outer walls */}
          <line x1="22" y1="26" x2="22" y2="132" />
          <line x1="98" y1="26" x2="98" y2="132" />
          <line x1="22" y1="26" x2="98" y2="26" />
          {/* floor lines */}
          <line x1="22" y1="60" x2="98" y2="60" />
          <line x1="22" y1="92" x2="98" y2="92" />
          {/* windows — top */}
          <rect x="32" y="34" width="14" height="18" rx="1" />
          <rect x="53" y="34" width="14" height="18" rx="1" />
          <rect x="74" y="34" width="14" height="18" rx="1" />
          {/* windows — middle (one lit) */}
          <rect x="32" y="66" width="14" height="18" rx="1" />
          <rect
            x="53"
            y="66"
            width="14"
            height="18"
            rx="1"
            fill="#0d9488"
            fillOpacity="0.12"
            stroke="#0d9488"
            strokeOpacity="0.55"
          />
          <rect x="74" y="66" width="14" height="18" rx="1" />
          {/* ground floor — doorways */}
          <rect x="32" y="100" width="14" height="24" rx="1" />
          <rect x="53" y="100" width="14" height="24" rx="1" />
          <rect x="74" y="100" width="14" height="24" rx="1" />
          {/* ground line */}
          <line x1="8" y1="132" x2="112" y2="132" />
        </svg>

        <div className="space-y-2">
          <h2 className="text-[1.35rem] font-semibold tracking-tight text-slate-900 md:text-2xl">
            ابدأ بإدارة أول مبنى
          </h2>
          <p className="mx-auto max-w-sm text-sm leading-7 text-slate-600">
            لم يتم ربط أي مبنى بحسابك بعد. لإضافة مبنى، تواصل مع فريق الدعم وسنهيّئ لك لوحة الإدارة خلال يوم عمل واحد.
          </p>
        </div>

        <a
          href="mailto:support@mishaa.sa"
          className="group inline-flex items-center gap-2 rounded-full border border-slate-900 bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
        >
          <span>تواصل مع الدعم</span>
          <span
            aria-hidden
            className="inline-block h-1.5 w-1.5 rounded-full bg-teal-300 transition-transform group-hover:scale-125"
          />
        </a>

        <p className="mt-1 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-slate-400" dir="ltr">
          support@mishaa.sa
        </p>
      </div>
    </section>
  )
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-3.5 w-3.5 text-slate-400" />
      <span className="text-sm tabular-nums font-medium text-slate-900">{value}</span>
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  )
}

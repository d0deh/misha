'use client'

import Link from 'next/link'
import { Building2, Vote, Wrench, Users } from 'lucide-react'
import { buildings, getBuildingData } from '@/lib/mock-data'

export default function BuildingsPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-4xl px-4 py-10 md:px-6 md:py-16">
        <div className="mb-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-900 text-sm font-bold text-white mb-4">
            م
          </div>
          <h1 className="text-3xl font-semibold text-stone-950">مِشاع</h1>
          <p className="mt-2 text-sm text-stone-600">
            اختر المبنى الذي تريد إدارته
          </p>
        </div>

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
                className="group rounded-lg border border-stone-200 bg-white p-5 transition-colors hover:border-teal-300 hover:bg-teal-50/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-stone-900 group-hover:text-teal-800">
                      {b.name}
                    </h2>
                    <p className="mt-1 text-sm text-stone-500" dir="ltr">
                      {b.nationalAddress}
                    </p>
                  </div>
                  <Building2 className="h-5 w-5 shrink-0 text-stone-400 group-hover:text-teal-600" />
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
      </div>
    </div>
  )
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-3.5 w-3.5 text-stone-400" />
      <span className="text-sm tabular-nums font-medium text-stone-900">{value}</span>
      <span className="text-xs text-stone-500">{label}</span>
    </div>
  )
}

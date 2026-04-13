export function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-slate-600 mb-3">
        {title}
      </h4>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

export function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="text-sm text-slate-600 w-24 shrink-0">{label}</span>
      <span className="text-base text-slate-700">{value}</span>
    </div>
  )
}

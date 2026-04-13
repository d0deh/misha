export default function Loading() {
  return (
    <div className="space-y-5 animate-pulse">
      <div>
        <div className="h-7 w-48 bg-slate-200 rounded" />
        <div className="h-4 w-72 bg-slate-100 rounded mt-2" />
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="h-10 flex-1 bg-slate-100 rounded-lg" />
        <div className="h-10 w-40 bg-slate-100 rounded-lg" />
        <div className="h-10 w-40 bg-slate-100 rounded-lg" />
      </div>
      <div className="rounded-lg border border-slate-200 overflow-hidden">
        <div className="h-10 bg-slate-100" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-12 bg-white border-b border-slate-100" />
        ))}
      </div>
      <div className="h-4 w-36 bg-slate-100 rounded" />
    </div>
  )
}

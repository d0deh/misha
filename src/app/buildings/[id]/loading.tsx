export default function Loading() {
  return (
    <div className="space-y-5 animate-pulse">
      <div>
        <div className="h-7 w-48 bg-stone-200 rounded" />
        <div className="h-4 w-72 bg-stone-100 rounded mt-2" />
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="h-10 flex-1 bg-stone-100 rounded-lg" />
        <div className="h-10 w-40 bg-stone-100 rounded-lg" />
        <div className="h-10 w-40 bg-stone-100 rounded-lg" />
      </div>
      <div className="rounded-lg border border-stone-200 overflow-hidden">
        <div className="h-10 bg-stone-100" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-12 bg-white border-b border-stone-100" />
        ))}
      </div>
      <div className="h-4 w-36 bg-stone-100 rounded" />
    </div>
  )
}

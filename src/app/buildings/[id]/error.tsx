'use client'

export default function BuildingError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
        <span className="text-2xl">!</span>
      </div>
      <h2 className="text-xl font-semibold text-stone-900">حدث خطأ غير متوقع</h2>
      <p className="max-w-md text-sm text-stone-600">
        عذراً، حدث خطأ أثناء تحميل الصفحة. يمكنك المحاولة مرة أخرى.
      </p>
      <button
        onClick={reset}
        className="rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
      >
        إعادة المحاولة
      </button>
    </div>
  )
}

'use client'

import { ErrorComposition } from '@/app/global-error'

export default function BuildingError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-[70vh]">
      <ErrorComposition
        headline="لم نتمكن من تحميل هذه الصفحة"
        body="يبدو أن شيئاً ما منع تحميل بيانات المبنى. جرّب مرة أخرى، وإن استمر الخطأ، عُد إلى قائمة المباني."
        onRetry={reset}
        digest={error.digest}
        showHomeLink
      />
    </div>
  )
}

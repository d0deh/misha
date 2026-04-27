'use client'

import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="ar" dir="rtl">
      <body
        className="min-h-screen bg-background font-sans text-foreground antialiased"
        style={{
          background:
            'radial-gradient(circle at 50% 12%, rgba(13,148,136,0.07), transparent 45%), linear-gradient(180deg, #fafaf7 0%, #f3f4f0 100%)',
        }}
      >
        <ErrorComposition
          headline="توقّفت الصفحة عن الاستجابة"
          body="حدث شيء غير متوقع أثناء تحميل هذه الصفحة. في أغلب الأحيان، تحلّ إعادة المحاولة المشكلة."
          onRetry={reset}
          digest={error.digest}
          showHomeLink
        />
      </body>
    </html>
  )
}

export function ErrorComposition({
  headline,
  body,
  onRetry,
  digest,
  showHomeLink = false,
}: {
  headline: string
  body: string
  onRetry: () => void
  digest?: string
  showHomeLink?: boolean
}) {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 py-16">
      {/* Blueprint corner marks — four L-shapes at the viewport corners.
          Reads as "this is a measured, deliberate page, not a crash." */}
      <CornerMarks />

      <article className="relative w-full">
        {/* the drawing */}
        <figure className="mb-10 flex flex-col items-center">
          <PlumbLine />
          <figcaption className="sr-only">
            رمز توقف — خط شاقولي ومثقال
          </figcaption>
        </figure>

        {/* the words */}
        <div className="space-y-4 text-center">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.28em] text-muted-foreground" dir="ltr">
            error · 500
          </p>
          <h1 className="text-balance text-[1.6rem] font-semibold leading-snug text-foreground md:text-[2rem]">
            {headline}
          </h1>
          <p className="mx-auto max-w-md text-balance text-[0.95rem] leading-8 text-muted-foreground">
            {body}
          </p>
        </div>

        {/* the actions — primary + secondary, generous touch targets */}
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            onClick={onRetry}
            className="group inline-flex h-12 min-w-48 items-center justify-center gap-2.5 rounded-full bg-shell px-6 text-[0.95rem] font-medium text-shell-foreground transition-all hover:bg-shell/92 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2"
          >
            <span
              aria-hidden
              className="inline-block h-1.5 w-1.5 rounded-full bg-teal-300 transition-transform group-hover:scale-125"
            />
            <span>إعادة المحاولة</span>
          </button>

          {showHomeLink && (
            <Link
              href="/buildings"
              className="inline-flex h-12 min-w-48 items-center justify-center rounded-full border border-border bg-card px-6 text-[0.95rem] font-medium text-foreground transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2"
            >
              العودة للرئيسية
            </Link>
          )}
        </div>

        {/* the fine print — debugging aid, not shouty */}
        {digest && (
          <p
            className="mt-12 text-center font-mono text-[0.72rem] tracking-[0.14em] text-muted-foreground"
            dir="ltr"
          >
            <span className="me-1 text-muted-foreground">trace</span>
            {digest}
          </p>
        )}
      </article>
    </main>
  )
}

/** Plumb-line at rest — an architectural glyph for "pause, realign, try again". */
function PlumbLine() {
  return (
    <svg
      viewBox="0 0 80 150"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      className="h-32 w-auto text-muted-foreground"
      aria-hidden
    >
      {/* fixed beam — solid, complete */}
      <line x1="14" y1="16" x2="66" y2="16" />
      {/* the anchor nail */}
      <circle cx="40" cy="16" r="1.8" fill="#0d9488" stroke="none" />
      {/* the string — softly swaying */}
      <g
        style={{
          transformOrigin: '40px 16px',
          animation: 'misha-plumb-sway 5.5s ease-in-out infinite',
        }}
      >
        <line x1="40" y1="17" x2="40" y2="108" />
        {/* the weight — a plumb-bob triangle, hollow but grounded */}
        <path d="M30 108 L50 108 L40 134 Z" fill="#ffffff" />
        <path d="M30 108 L50 108 L40 134 Z" />
        {/* top cap of the bob */}
        <line x1="30" y1="108" x2="50" y2="108" />
      </g>
      {/* the ground line it's almost touching — but not quite. the point. */}
      <line
        x1="16"
        y1="142"
        x2="64"
        y2="142"
        strokeDasharray="2 3"
        strokeOpacity="0.6"
      />
    </svg>
  )
}

/** Subtle blueprint corner marks — four tiny L-brackets anchoring the viewport. */
function CornerMarks() {
  return (
    <div className="pointer-events-none fixed inset-0" aria-hidden>
      {/* top-inline-start (right in RTL) */}
      <svg
        className="absolute top-6 start-6 h-5 w-5 text-border"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
      >
        <path d="M20 0 L0 0 L0 20" />
      </svg>
      {/* top-inline-end (left in RTL) */}
      <svg
        className="absolute top-6 end-6 h-5 w-5 text-border"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
      >
        <path d="M0 0 L20 0 L20 20" />
      </svg>
      {/* bottom-inline-start */}
      <svg
        className="absolute bottom-6 start-6 h-5 w-5 text-border"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
      >
        <path d="M20 20 L0 20 L0 0" />
      </svg>
      {/* bottom-inline-end */}
      <svg
        className="absolute bottom-6 end-6 h-5 w-5 text-border"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
      >
        <path d="M0 20 L20 20 L20 0" />
      </svg>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { MishaMark } from '@/components/brand/misha-logo'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <ErrorComposition
          headline="ØªÙˆÙ‚Ù‘ÙØª Ø§Ù„ØµÙØ­Ø© Ø¹Ù† Ø§Ù„Ø§Ø³ØªØ¬Ø§Ø¨Ø©"
          body="Ø­Ø¯Ø« Ø´ÙŠØ¡ ØºÙŠØ± Ù…ØªÙˆÙ‚Ø¹ Ø£Ø«Ù†Ø§Ø¡ ØªØ­Ù…ÙŠÙ„ Ù‡Ø°Ù‡ Ø§Ù„ØµÙØ­Ø©. ÙÙŠ Ø£ØºÙ„Ø¨ Ø§Ù„Ø£Ø­ÙŠØ§Ù†ØŒ ØªØ­Ù„Ù‘ Ø¥Ø¹Ø§Ø¯Ø© Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø© Ø§Ù„Ù…Ø´ÙƒÙ„Ø©."
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
      {/* Blueprint corner marks â€” four L-shapes at the viewport corners.
          Reads as "this is a measured, deliberate page, not a crash." */}
      <CornerMarks />

      <article className="relative w-full">
        {/* the drawing */}
        <figure className="mb-10 flex flex-col items-center">
          <MishaMark size={72} tone="brand" />
          <figcaption className="sr-only">
            Ø±Ù…Ø² ØªÙˆÙ‚Ù â€” Ø®Ø· Ø´Ø§Ù‚ÙˆÙ„ÙŠ ÙˆÙ…Ø«Ù‚Ø§Ù„
          </figcaption>
        </figure>

        {/* the words */}
        <div className="space-y-4 text-center">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.28em] text-muted-foreground" dir="ltr">
            error Â· 500
          </p>
          <h1 className="text-balance text-[1.6rem] font-medium leading-snug text-foreground md:text-[2rem]">
            {headline}
          </h1>
          <p className="mx-auto max-w-md text-balance text-[0.95rem] leading-8 text-muted-foreground">
            {body}
          </p>
        </div>

        {/* the actions â€” primary + secondary, generous touch targets */}
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            onClick={onRetry}
            className="group inline-flex h-12 min-w-48 items-center justify-center gap-2.5 rounded-xl bg-primary px-6 text-[0.95rem] font-medium text-primary-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45 focus-visible:ring-offset-2"
          >
            <span
              aria-hidden
              className="inline-block h-1.5 w-1.5 rounded-full bg-accent transition-transform group-hover:scale-125"
            />
            <span>Ø¥Ø¹Ø§Ø¯Ø© Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø©</span>
          </button>

          {showHomeLink && (
            <Link
              href="/buildings"
              className="inline-flex h-12 min-w-48 items-center justify-center rounded-full border border-border bg-card px-6 text-[0.95rem] font-medium text-foreground transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2"
            >
              Ø§Ù„Ø¹ÙˆØ¯Ø© Ù„Ù„Ø±Ø¦ÙŠØ³ÙŠØ©
            </Link>
          )}
        </div>

        {/* the fine print â€” debugging aid, not shouty */}
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

/** Subtle blueprint corner marks â€” four tiny L-brackets anchoring the viewport. */
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

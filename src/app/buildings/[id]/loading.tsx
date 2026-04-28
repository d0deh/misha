export default function Loading() {
  return (
    <div
      role="status"
      aria-label="جاري تحميل لوحة التحكم"
      className="space-y-6"
    >
      {/* Page header block — mirrors .page-header-block shape */}
      <div className="page-header-block gap-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 space-y-2.5">
            <Bar className="h-3 w-24" delay={0} />
            <Bar className="h-7 w-72 md:h-8 md:w-96" delay={60} tone="strong" />
            <Bar className="h-4 w-64" delay={120} />
          </div>
          <Bar className="hidden h-11 w-28 rounded-[1rem] md:block" delay={180} />
        </div>
      </div>

      {/* Summary metric cards row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="metric-card">
            <div className="space-y-3">
              <Bar className="h-3 w-20" delay={i * 60} />
              <Bar className="h-8 w-16" delay={i * 60 + 40} tone="strong" />
              <Bar className="h-3 w-28" delay={i * 60 + 80} />
            </div>
            <Bar className="h-10 w-10 rounded-2xl self-start" delay={i * 60 + 120} />
          </div>
        ))}
      </div>

      {/* Two-column content: decisions & activity */}
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="page-shell space-y-3 p-5">
          <div className="flex items-center justify-between">
            <Bar className="h-4 w-32" delay={240} tone="strong" />
            <Bar className="h-3 w-16" delay={280} />
          </div>
          <div className="space-y-3 pt-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="space-y-2 rounded-xl border border-border border-s-[4px] border-s-border bg-card p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <Bar className="h-4 w-48 md:w-64" delay={300 + i * 80} tone="strong" />
                  <Bar className="h-5 w-14 rounded-full" delay={320 + i * 80} />
                </div>
                <Bar className="h-3 w-full max-w-md" delay={340 + i * 80} />
                <div className="flex items-center gap-2 pt-1">
                  <Bar className="h-1.5 w-24 rounded-full" delay={360 + i * 80} />
                  <Bar className="h-3 w-10" delay={380 + i * 80} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="page-shell space-y-3 p-5">
          <Bar className="h-4 w-28" delay={240} tone="strong" />
          <div className="space-y-4 pt-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <Bar
                  className="mt-1.5 h-1.5 w-1.5 rounded-full shrink-0"
                  delay={260 + i * 60}
                />
                <div className="flex-1 space-y-1.5">
                  <Bar
                    className={i % 2 === 0 ? 'h-3.5 w-44' : 'h-3.5 w-52'}
                    delay={280 + i * 60}
                  />
                  <Bar className="h-2.5 w-14" delay={300 + i * 60} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <span className="sr-only">يرجى الانتظار…</span>
    </div>
  )
}

type BarProps = {
  className?: string
  /** animation delay in ms, staggered across the layout for a breathing feel */
  delay?: number
  /** visual weight — strong bars read as headlines, default bars as body */
  tone?: 'default' | 'strong'
}

function Bar({ className = '', delay = 0, tone = 'default' }: BarProps) {
  const palette =
    tone === 'strong'
      ? 'bg-muted-foreground/18'
      : 'bg-muted/80'
  return (
    <span
      aria-hidden
      className={`block rounded-md ${palette} ${className}`}
      style={{
        animation: 'misha-skeleton-pulse 2.1s ease-in-out infinite',
        animationDelay: `${delay}ms`,
      }}
    />
  )
}

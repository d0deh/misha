import * as React from 'react'
import { cn } from '@/lib/utils'

type MishaMarkTone = 'brand' | 'light' | 'mono'

const markTones: Record<
  MishaMarkTone,
  {
    green: string
    gold: string
    center: string
    centerStroke: string
  }
> = {
  brand: {
    green: '#0B3528',
    gold: '#CDA45E',
    center: '#F5F2EA',
    centerStroke: '#FFFFFF',
  },
  light: {
    green: '#F5F2EA',
    gold: '#CDA45E',
    center: '#0B3528',
    centerStroke: '#FFFFFF',
  },
  mono: {
    green: 'currentColor',
    gold: 'currentColor',
    center: '#F5F2EA',
    centerStroke: 'currentColor',
  },
}

type MishaMarkProps = React.SVGProps<SVGSVGElement> & {
  size?: number | string
  tone?: MishaMarkTone
}

export function MishaMark({
  size = 32,
  tone = 'brand',
  className,
  ...props
}: MishaMarkProps) {
  const colors = markTones[tone]

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className={cn('shrink-0 overflow-visible', className)}
      {...props}
    >
      <path
        d="M8 8H24.5C26.1 8 27.7 8.65 28.85 9.78L56 36.95V56H39.45C37.82 56 36.28 55.36 35.13 54.22L8 27.05V8Z"
        fill={colors.green}
      />
      <path
        d="M56 8V24.55C56 26.18 55.36 27.72 54.22 28.87L27.05 56H8V39.45C8 37.82 8.64 36.28 9.78 35.13L36.95 8H56Z"
        fill={colors.gold}
      />
      <path
        d="M32 19.25L44.75 32L32 44.75L19.25 32L32 19.25Z"
        fill={colors.center}
        stroke={colors.centerStroke}
        strokeWidth="5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

type MishaWordmarkProps = {
  className?: string
  showEnglish?: boolean
  tone?: 'brand' | 'light'
  compact?: boolean
}

export function MishaWordmark({
  className,
  showEnglish = true,
  tone = 'brand',
  compact = false,
}: MishaWordmarkProps) {
  const isLight = tone === 'light'

  return (
    <span className={cn('flex min-w-0 flex-col leading-none', className)}>
      <span
        className={cn(
          'text-[1.45rem] font-semibold leading-[1.05]',
          compact && 'text-[1.08rem]',
          isLight ? 'text-white' : 'text-[#0B3528]'
        )}
      >
        مِشاع
      </span>
      {showEnglish && (
        <span
          className={cn(
            'mt-1 text-[1.03rem] font-medium leading-none',
            compact && 'text-[0.78rem]',
            'text-[#CDA45E]'
          )}
          dir="ltr"
        >
          Misha
        </span>
      )}
    </span>
  )
}

type MishaLogoProps = {
  className?: string
  markSize?: number
  showEnglish?: boolean
  tone?: 'brand' | 'light'
  compact?: boolean
}

export function MishaLogo({
  className,
  markSize = 40,
  showEnglish = true,
  tone = 'brand',
  compact = false,
}: MishaLogoProps) {
  return (
    <span className={cn('inline-flex min-w-0 items-center gap-3', className)}>
      <MishaMark size={markSize} tone={tone === 'light' ? 'light' : 'brand'} />
      <MishaWordmark showEnglish={showEnglish} tone={tone} compact={compact} />
    </span>
  )
}

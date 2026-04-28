import * as React from 'react'
import { cn } from '@/lib/utils'

type MishaMarkTone = 'brand' | 'light' | 'mono'

const markTones: Record<
  MishaMarkTone,
  {
    topStart: string
    topEnd: string
    bottomStart: string
    bottomEnd: string
  }
> = {
  brand: {
    topStart: '#0B3528',
    topEnd: '#0B3528',
    bottomStart: '#CDA45E',
    bottomEnd: '#1F5E47',
  },
  light: {
    topStart: '#FFFFFF',
    topEnd: '#F5F2EA',
    bottomStart: '#CDA45E',
    bottomEnd: '#7D9488',
  },
  mono: {
    topStart: 'currentColor',
    topEnd: 'currentColor',
    bottomStart: 'currentColor',
    bottomEnd: 'currentColor',
  },
}

type MishaMarkProps = React.SVGProps<SVGSVGElement> & {
  size?: number | string
  tone?: MishaMarkTone
  framed?: boolean
}

export function MishaMark({
  size = 32,
  tone = 'brand',
  framed = false,
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
      className={cn('shrink-0', className)}
      {...props}
    >
      {framed && <rect width="64" height="64" rx="16" fill="#0B3528" />}
      <rect x="8" y="8" width="20" height="20" rx="4" fill={colors.topStart} />
      <rect x="36" y="8" width="20" height="20" rx="4" fill={colors.topEnd} />
      <rect x="8" y="36" width="20" height="20" rx="4" fill={colors.bottomStart} />
      <rect x="36" y="36" width="20" height="20" rx="4" fill={colors.bottomEnd} />
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
            isLight ? 'text-[#CDA45E]' : 'text-[#CDA45E]'
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

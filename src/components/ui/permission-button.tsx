'use client'

import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import type { ComponentProps } from 'react'

interface PermissionButtonProps extends ComponentProps<typeof Button> {
  hasPermission: boolean
  tooltipText?: string
}

export function PermissionButton({
  hasPermission,
  tooltipText = 'ليس لديك صلاحية',
  children,
  ...props
}: PermissionButtonProps) {
  if (hasPermission) {
    return <Button {...props}>{children}</Button>
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={<span className="inline-flex" />}
        >
          <Button {...props} disabled>
            {children}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{tooltipText}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

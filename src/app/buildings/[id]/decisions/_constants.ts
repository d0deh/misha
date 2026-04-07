export const categoryBadge: Record<string, string> = {
  financial: 'border-warning/20 bg-warning/10 text-warning',
  maintenance: 'border-primary/20 bg-primary/10 text-primary',
  governance: 'border-violet-200 bg-violet-50 text-violet-700',
  general: 'border-border bg-muted text-muted-foreground',
}

export const categoryBorder: Record<string, string> = {
  financial: 'border-s-warning',
  maintenance: 'border-s-primary',
  governance: 'border-s-violet-400',
  general: 'border-s-border',
}

export const statusBadgeStyles: Record<string, { dot: string; badge: string }> = {
  open: { dot: 'bg-warning', badge: 'border-warning/20 bg-warning/10 text-warning' },
  approved: { dot: 'bg-success', badge: 'border-success/20 bg-success/10 text-success' },
  rejected: {
    dot: 'bg-destructive',
    badge: 'border-destructive/20 bg-destructive/10 text-destructive',
  },
  draft: { dot: 'bg-muted-foreground', badge: 'border-border bg-muted text-muted-foreground' },
  closed: { dot: 'bg-muted-foreground', badge: 'border-border bg-muted text-muted-foreground' },
}

export const voteOptionStyles: Record<string, { dot: string; text: string; label: string }> = {
  approve: { dot: 'bg-success', text: 'text-success', label: 'موافق' },
  reject: { dot: 'bg-destructive', text: 'text-destructive', label: 'رافض' },
  abstain: { dot: 'bg-muted-foreground', text: 'text-muted-foreground', label: 'ممتنع' },
}

export const voteButtonOptions: {
  key: 'approve' | 'reject' | 'abstain'
  label: string
  activeClass: string
  inactiveClass: string
}[] = [
  {
    key: 'approve',
    label: 'موافق',
    activeClass: 'border-success bg-success text-success-foreground hover:bg-success/90',
    inactiveClass: 'border-border text-foreground hover:bg-muted/55',
  },
  {
    key: 'reject',
    label: 'رفض',
    activeClass:
      'border-destructive bg-destructive text-destructive-foreground hover:bg-destructive/90',
    inactiveClass: 'border-border text-foreground hover:bg-muted/55',
  },
  {
    key: 'abstain',
    label: 'امتناع',
    activeClass: 'border-foreground bg-foreground text-background hover:bg-foreground/90',
    inactiveClass: 'border-border text-foreground hover:bg-muted/55',
  },
]

export const priorityStyles: Record<string, { dot: string; badge: string }> = {
  urgent: { dot: 'bg-destructive', badge: 'border-destructive/20 bg-destructive/10 text-destructive' },
  high: { dot: 'bg-warning', badge: 'border-warning/20 bg-warning/10 text-warning' },
  medium: { dot: 'bg-muted-foreground', badge: 'border-border bg-muted text-muted-foreground' },
  low: { dot: 'bg-muted-foreground', badge: 'border-border bg-muted/70 text-muted-foreground' },
}

export const statusStyles: Record<string, { dot: string; badge: string }> = {
  new: { dot: 'bg-warning', badge: 'border-warning/20 bg-warning/10 text-warning' },
  in_progress: { dot: 'bg-primary', badge: 'border-primary/20 bg-primary/10 text-primary' },
  completed: { dot: 'bg-success', badge: 'border-success/20 bg-success/10 text-success' },
  cancelled: { dot: 'bg-muted-foreground', badge: 'border-border bg-muted text-muted-foreground' },
}

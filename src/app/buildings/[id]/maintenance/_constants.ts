export const priorityStyles: Record<string, { dot: string; badge: string }> = {
  urgent: { dot: 'bg-red-500', badge: 'bg-red-50 text-red-700 border-red-200' },
  high: { dot: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  medium: { dot: 'bg-stone-500', badge: 'bg-stone-100 text-stone-600 border-stone-200' },
  low: { dot: 'bg-stone-400', badge: 'bg-stone-50 text-stone-600 border-stone-200' },
}

export const statusStyles: Record<string, { dot: string; badge: string }> = {
  new: { dot: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  in_progress: { dot: 'bg-teal-500', badge: 'bg-teal-50 text-teal-700 border-teal-200' },
  completed: { dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  cancelled: { dot: 'bg-stone-400', badge: 'bg-stone-100 text-stone-600 border-stone-200' },
}

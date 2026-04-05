export const categoryBadge: Record<string, string> = {
  financial: 'bg-amber-50 text-amber-700 border-amber-200',
  maintenance: 'bg-teal-50 text-teal-700 border-teal-200',
  governance: 'bg-violet-50 text-violet-700 border-violet-200',
  general: 'bg-stone-100 text-stone-600 border-stone-200',
}

export const categoryBorder: Record<string, string> = {
  financial: 'border-s-amber-400',
  maintenance: 'border-s-teal-400',
  governance: 'border-s-violet-400',
  general: 'border-s-stone-300',
}

export const statusBadgeStyles: Record<string, { dot: string; badge: string }> = {
  open: { dot: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  approved: { dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  rejected: { dot: 'bg-red-500', badge: 'bg-red-50 text-red-700 border-red-200' },
  draft: { dot: 'bg-stone-400', badge: 'bg-stone-100 text-stone-600 border-stone-200' },
  closed: { dot: 'bg-stone-400', badge: 'bg-stone-100 text-stone-600 border-stone-200' },
}

export const voteOptionStyles: Record<string, { dot: string; text: string; label: string }> = {
  approve: { dot: 'bg-emerald-500', text: 'text-emerald-700', label: 'موافق' },
  reject: { dot: 'bg-red-500', text: 'text-red-700', label: 'رافض' },
  abstain: { dot: 'bg-stone-400', text: 'text-stone-600', label: 'ممتنع' },
}

export const voteButtonOptions: { key: 'approve' | 'reject' | 'abstain'; label: string; activeClass: string; inactiveClass: string }[] = [
  {
    key: 'approve',
    label: 'موافق',
    activeClass: 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700',
    inactiveClass: 'border-stone-300 text-stone-700 hover:bg-stone-50',
  },
  {
    key: 'reject',
    label: 'رفض',
    activeClass: 'bg-red-600 text-white border-red-600 hover:bg-red-700',
    inactiveClass: 'border-stone-300 text-stone-700 hover:bg-stone-50',
  },
  {
    key: 'abstain',
    label: 'امتناع',
    activeClass: 'bg-stone-600 text-white border-stone-600 hover:bg-stone-700',
    inactiveClass: 'border-stone-300 text-stone-700 hover:bg-stone-50',
  },
]

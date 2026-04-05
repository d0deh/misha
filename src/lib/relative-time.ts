export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)

  if (diffMin < 1) return 'الآن'
  if (diffMin === 1) return 'منذ دقيقة'
  if (diffMin === 2) return 'منذ دقيقتين'
  if (diffMin <= 10) return `منذ ${diffMin} دقائق`
  if (diffMin < 60) return `منذ ${diffMin} دقيقة`

  if (diffHours === 1) return 'منذ ساعة'
  if (diffHours === 2) return 'منذ ساعتين'

  const isToday = date.toDateString() === now.toDateString()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const isYesterday = date.toDateString() === yesterday.toDateString()

  const time = date.toLocaleTimeString('ar-SA', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  if (isToday) return `اليوم ${time}`
  if (isYesterday) return `أمس ${time}`

  return date.toLocaleDateString('ar-SA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

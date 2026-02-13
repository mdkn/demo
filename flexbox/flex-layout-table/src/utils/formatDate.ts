// T043: Date formatting utility function
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInHours = diffInMs / (1000 * 60 * 60)
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24)

  // Less than 24 hours ago - show time
  if (diffInHours < 24) {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  // Less than 7 days ago - show day of week
  if (diffInDays < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'short' })
  }

  // Less than 365 days ago - show month and day
  if (diffInDays < 365) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // More than a year ago - show full date
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

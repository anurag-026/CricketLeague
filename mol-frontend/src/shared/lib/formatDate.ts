const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: 'numeric',
  minute: '2-digit',
})

export function formatPlayedAt(iso: string): { date: string; time: string } {
  const d = new Date(iso)
  return {
    date: dateFormatter.format(d),
    time: timeFormatter.format(d),
  }
}

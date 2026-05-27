import { useEffect, useState } from 'react'
import { fetchMyMatchHistory } from '@/features/stats/api'
import type { MatchHistoryItem } from '@/shared/types/stats'

export function useMatchHistory(limit = 30) {
  const [matches, setMatches] = useState<MatchHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [trackedLimit, setTrackedLimit] = useState(limit)

  if (trackedLimit !== limit) {
    setTrackedLimit(limit)
    setMatches([])
    setLoading(true)
    setError(null)
  }

  useEffect(() => {
    let cancelled = false
    void fetchMyMatchHistory(limit)
      .then((data) => {
        if (!cancelled) setMatches(data)
      })
      .catch(() => {
        if (!cancelled) {
          setMatches([])
          setError('Could not load match history')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [limit])

  return { matches, loading, error }
}

import { useEffect, useState } from 'react'
import { fetchMyStats } from '@/features/stats/api'
import type { PlayerStatsResponse } from '@/shared/types/stats'

export function usePlayerStats() {
  const [stats, setStats] = useState<PlayerStatsResponse | null>(null)

  useEffect(() => {
    void fetchMyStats()
      .then(setStats)
      .catch(() => setStats(null))
  }, [])

  return stats
}

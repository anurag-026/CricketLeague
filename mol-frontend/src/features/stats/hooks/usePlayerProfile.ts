import { useEffect, useState } from 'react'
import { fetchMyProfile } from '@/features/stats/api'
import type { PlayerProfileResponse } from '@/shared/types/stats'

export function usePlayerProfile() {
  const [profile, setProfile] = useState<PlayerProfileResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    let cancelled = false
    void fetchMyProfile()
      .then((data) => {
        if (!cancelled) setProfile(data)
      })
      .catch(() => {
        if (!cancelled) {
          setProfile(null)
          setError('Could not load profile')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { profile, loading, error }
}

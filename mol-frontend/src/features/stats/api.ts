import { http } from '@/shared/api/axios'
import type {
  MatchHistoryItem,
  PlayerProfileResponse,
  PlayerStatsResponse,
} from '@/shared/types/stats'

export async function fetchMyProfile(): Promise<PlayerProfileResponse> {
  const { data } = await http.get<PlayerProfileResponse>('/api/v1/players/me/profile')
  return data
}

export async function fetchMyStats(): Promise<PlayerStatsResponse> {
  const { data } = await http.get<PlayerStatsResponse>('/api/v1/players/me/stats')
  return data
}

export async function fetchMyMatchHistory(limit = 20): Promise<MatchHistoryItem[]> {
  const { data } = await http.get<MatchHistoryItem[]>('/api/v1/players/me/matches', {
    params: { limit },
  })
  return data
}

import { http } from '@/shared/api/axios'
import { publish } from '@/shared/api/stompClient'
import type { GameActionRequest, MatchLiveStateResponse } from '@/shared/types'

export function submitNumber(matchId: string, payload: GameActionRequest): void {
  publish(`/app/match/${matchId}/action`, payload)
}

export async function fetchMatchState(
  matchId: string,
): Promise<MatchLiveStateResponse> {
  const { data } = await http.get<MatchLiveStateResponse>(
    `/api/v1/match/${matchId}/state`,
  )
  return data
}

export async function leaveMatch(matchId: string): Promise<void> {
  await http.post(`/api/v1/match/${matchId}/leave`)
}

export async function forfeitMatch(matchId: string): Promise<void> {
  await http.post(`/api/v1/match/${matchId}/forfeit`)
}

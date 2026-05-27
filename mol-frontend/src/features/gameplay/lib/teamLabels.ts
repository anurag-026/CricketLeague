import type { DuelStateDto } from '@/shared/types'
import type { TeamId } from '@/shared/types/match'

export function teamLabelsForDuel(
  myDuel: DuelStateDto | null | undefined,
  localUserId: string | undefined,
  playerUsernames: Record<string, string> | null,
): { teamA: string; teamB: string } {
  if (!myDuel || !localUserId) {
    return { teamA: 'Team A', teamB: 'Team B' }
  }

  const myTeam: TeamId = myDuel.playerA === localUserId ? 'TEAM_A' : 'TEAM_B'
  const opponentId = myDuel.playerA === localUserId ? myDuel.playerB : myDuel.playerA
  const opponentName = playerUsernames?.[opponentId] ?? 'Opponent'

  return myTeam === 'TEAM_A'
    ? { teamA: 'You', teamB: opponentName }
    : { teamA: opponentName, teamB: 'You' }
}

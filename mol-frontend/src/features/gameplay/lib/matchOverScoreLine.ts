import { teamLabelsForDuel } from '@/features/gameplay/lib/teamLabels'
import type { DuelStateDto, MatchOverEvent } from '@/shared/types'
import type { TeamId } from '@/shared/types/match'

export function formatMatchOverScoreLine(
  event: MatchOverEvent,
  options: {
    teamSize: number
    myDuel: DuelStateDto | null | undefined
    localPlayerId: string | null | undefined
    playerUsernames: Record<string, string> | null
  },
): string {
  const { teamSize, myDuel, localPlayerId, playerUsernames } = options
  const scoreA = event.finalScores.TEAM_A
  const scoreB = event.finalScores.TEAM_B

  if (teamSize === 1 && myDuel && localPlayerId) {
    const opponentId =
      myDuel.playerA === localPlayerId ? myDuel.playerB : myDuel.playerA
    const myTeam: TeamId = myDuel.playerA === localPlayerId ? 'TEAM_A' : 'TEAM_B'
    const oppTeam: TeamId = myTeam === 'TEAM_A' ? 'TEAM_B' : 'TEAM_A'
    const myScore = event.finalScores[myTeam] ?? {
      runs: myTeam === 'TEAM_A' ? myDuel.scoreA : myDuel.scoreB,
      wickets: myTeam === 'TEAM_A' ? (myDuel.playerAOut ? 1 : 0) : myDuel.playerBOut ? 1 : 0,
    }
    const oppScore = event.finalScores[oppTeam] ?? {
      runs: oppTeam === 'TEAM_A' ? myDuel.scoreA : myDuel.scoreB,
      wickets: oppTeam === 'TEAM_A' ? (myDuel.playerAOut ? 1 : 0) : myDuel.playerBOut ? 1 : 0,
    }
    const opponentName = playerUsernames?.[opponentId] ?? 'Opponent'
    return `You ${myScore.runs}/${myScore.wickets} · ${opponentName} ${oppScore.runs}/${oppScore.wickets}`
  }

  const { teamA, teamB } = teamLabelsForDuel(
    myDuel,
    localPlayerId ?? undefined,
    playerUsernames,
  )
  return `${teamA} ${scoreA.runs}/${scoreA.wickets} · ${teamB} ${scoreB.runs}/${scoreB.wickets}`
}

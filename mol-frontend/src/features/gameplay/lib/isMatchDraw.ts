import type { MatchOverEvent } from '@/shared/types'

/** True when the match has no winner or both sides finished with the same runs. */
export function isMatchDraw(event: MatchOverEvent): boolean {
  if (event.winner == null) {
    return true
  }
  const scoreA = event.finalScores.TEAM_A?.runs ?? 0
  const scoreB = event.finalScores.TEAM_B?.runs ?? 0
  return scoreA === scoreB
}

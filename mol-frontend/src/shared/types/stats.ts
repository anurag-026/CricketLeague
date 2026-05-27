export interface PlayerProfileResponse {
  userId: string
  username: string
  email: string
  matchesPlayed: number
  wins: number
  losses: number
  currentWinStreak: number
  bestWinStreak: number
  totalRunsScored: number
}

export interface PlayerStatsResponse {
  userId: string
  matchesPlayed: number
  wins: number
  losses: number
  currentWinStreak: number
  bestWinStreak: number
  totalRunsScored: number
}

export interface MatchHistoryItem {
  matchId: string
  roomCode: string | null
  opponentUsername: string | null
  playerTeam: 'TEAM_A' | 'TEAM_B'
  winnerTeam: 'TEAM_A' | 'TEAM_B' | null
  teamAScore: number
  teamBScore: number
  runsScored: number
  won: boolean
  winMargin: string | null
  playedAt: string
}

import type { TeamId } from './match'

export type MatchPhase =
  | 'WAITING'
  | 'IN_PROGRESS'
  | 'INNINGS_BREAK'
  | 'MATCH_OVER'

export type DuelStatus = 'ACTIVE' | 'COMPLETED' | 'FORFEITED' | 'DRAW'

export type BallOutcome = 'RUNS_SCORED' | 'WICKET'

export interface ScoreLine {
  runs: number
  wickets: number
}

export interface MatchConfigDto {
  totalOvers: number
  teamSize: number
}

export interface CurrentStateDto {
  battingTeam: TeamId
  currentBatsman: string | null
  currentBowler: string | null
}

export interface DuelStartDto {
  duelId: string
  playerA: string
  playerB: string
}

export interface DuelStateDto {
  duelId: string
  playerA: string
  playerB: string
  scoreA: number
  scoreB: number
  battingPlayerId: string
  bowlingPlayerId: string
  ballOpen: boolean
  ballDeadlineEpochMs: number
  ballsRemaining: number
  lastBatsmanPick: number | null
  lastBowlerPick: number | null
  lastRunsOnBall: number | null
  lastBallWicket: boolean
  lastBatsmanMissed: boolean
  lastBowlerMissed: boolean
  status: DuelStatus
  playerAOut: boolean
  playerBOut: boolean
  teamABallMarks: string[]
  teamBBallMarks: string[]
}

export interface MatchStateSnapshot {
  teamAScore: number
  teamAWickets: number
  teamBScore: number
  teamBWickets: number
  ballsRemainingInInnings: number
  teamABallMarks: string[]
  teamBBallMarks: string[]
}

export interface MatchLiveStateResponse {
  matchId: string
  phase: MatchPhase
  innings: number
  config: MatchConfigDto
  scoreboard: MatchStateSnapshot
  currentState: CurrentStateDto
  teams: Record<TeamId, string[]>
  playerUsernames: Record<string, string>
  myDuel: DuelStateDto | null
  duels: DuelStartDto[]
  winner: TeamId | null
  winMargin: string | null
}

export interface GameActionRequest {
  actionType: 'SUBMIT_NUMBER'
  playerId: string
  numberChosen: number
}

export interface MatchStartEvent {
  eventType: 'MATCH_START'
  matchId: string
  config: MatchConfigDto
  teams: Record<TeamId, string[]>
  duels: DuelStartDto[]
  currentState: CurrentStateDto
  playerUsernames: Record<string, string>
}

export interface BallOpenEvent {
  eventType: 'BALL_OPEN'
  matchId: string
  duelId: string
  batsmanId: string
  bowlerId: string
  deadlineEpochMs: number
  ballsRemaining: number
}

export interface BallResolvedEvent {
  eventType: 'BALL_RESOLVED'
  matchId: string
  duelId: string
  batsmanPick: number | null
  bowlerPick: number | null
  wicket: boolean
  batsmanMissed: boolean
  bowlerMissed: boolean
  runsOnBall: number
  duelScoreA: number
  duelScoreB: number
  battingPlayerId: string
  bowlingPlayerId: string
  ballsRemaining: number
  teamAScore: number
  teamBScore: number
  teamAWickets: number
  teamBWickets: number
  teamABallMarks: string[]
  teamBBallMarks: string[]
  duelStatus: DuelStatus
  playerAOut: boolean
  playerBOut: boolean
}

export interface DuelEndedEvent {
  eventType: 'DUEL_ENDED'
  matchId: string
  duelId: string
  winnerTeam: TeamId
  forfeit: boolean
  duelScoreA: number
  duelScoreB: number
  teamAScore: number
  teamBScore: number
}

export interface BallBowledEvent {
  eventType: 'BALL_BOWLED'
  batsmanNumber: number
  bowlerNumber: number
  outcome: BallOutcome
  runsOnBall: number
  matchState: MatchStateSnapshot
}

export interface WicketEvent {
  eventType: 'WICKET'
  batsmanNumber: number
  bowlerNumber: number
  outcome: BallOutcome
  playerOut: string
  nextBatsman: string | null
  matchState: MatchStateSnapshot
}

export interface MatchOverEvent {
  eventType: 'MATCH_OVER'
  winner: TeamId | null
  winMargin: string
  finalScores: Record<TeamId, ScoreLine>
}

export type MatchGameEvent =
  | MatchStartEvent
  | BallOpenEvent
  | BallResolvedEvent
  | DuelEndedEvent
  | BallBowledEvent
  | WicketEvent
  | MatchOverEvent

export interface GameState {
  snapshot: MatchStateSnapshot | null
  config: MatchConfigDto | null
  currentState: CurrentStateDto | null
  teams: Record<TeamId, string[]> | null
  playerUsernames: Record<string, string> | null
  myDuelId: string | null
  myDuel: DuelStateDto | null
  ballDeadlineEpochMs: number | null
  statusMessage: string
  localPlayerId: string | null
  localTeamId: TeamId | null
  isConnected: boolean
  selectedGuess: number | null
  pickLocked: boolean
  matchOver: MatchOverEvent | null
  duelEnded: boolean
}

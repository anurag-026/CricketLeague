export type TeamId = 'TEAM_A' | 'TEAM_B'

export type RoomStatus = 'WAITING_FOR_PLAYERS' | 'STARTED'

export interface CreateRoomRequest {
  teamSize: number
  overs: number
}

export interface CreateRoomResponse {
  roomCode: string
  matchId: string
  expiresIn: number
}

export interface JoinRoomResponse {
  matchId: string
  teamAssigned: TeamId
  matchStarted: boolean
}

export interface QueueResponse {
  status: string
  estimatedWaitTimeSeconds: number
}

export interface RoomStatusResponse {
  roomCode: string
  matchId: string
  status: RoomStatus
  teamSize: number
  overs: number
  playersJoined: number
  playersRequired: number
  teamA: string[]
  teamB: string[]
  yourTeam: TeamId | null
}

export interface ActiveMatchResponse {
  matchId: string | null
  inMatch: boolean
}

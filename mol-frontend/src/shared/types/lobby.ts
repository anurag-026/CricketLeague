import type { TeamId } from './match'

export type LobbyMode = 'queue' | 'host' | 'join'

export interface LobbyLocationState {
  mode?: LobbyMode
  matchId?: string
  estimatedWait?: number
  expiresIn?: number
  team?: TeamId
}

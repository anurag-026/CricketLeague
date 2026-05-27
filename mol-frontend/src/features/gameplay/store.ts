import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type {
  CurrentStateDto,
  DuelStateDto,
  GameState,
  MatchConfigDto,
  MatchOverEvent,
  MatchStateSnapshot,
  TeamId,
} from '@/shared/types'

interface GameplayState extends GameState {
  setSnapshot: (snapshot: MatchStateSnapshot | null) => void
  setConfig: (config: MatchConfigDto | null) => void
  setCurrentState: (current: CurrentStateDto | null) => void
  setTeams: (teams: Record<TeamId, string[]> | null) => void
  setPlayerUsernames: (names: Record<string, string> | null) => void
  setMyDuel: (duel: DuelStateDto | null) => void
  setMyDuelId: (id: string | null) => void
  setBallDeadline: (epochMs: number | null) => void
  setStatusMessage: (message: string) => void
  setLocalPlayerId: (id: string | null) => void
  setLocalTeamId: (team: TeamId | null) => void
  setConnected: (connected: boolean) => void
  setSelectedGuess: (guess: number | null) => void
  setPickLocked: (locked: boolean) => void
  setMatchOver: (event: MatchOverEvent | null) => void
  setDuelEnded: (ended: boolean) => void
  reset: () => void
}

const initialState: GameState = {
  snapshot: null,
  config: null,
  currentState: null,
  teams: null,
  playerUsernames: null,
  myDuelId: null,
  myDuel: null,
  ballDeadlineEpochMs: null,
  statusMessage: 'Connecting to arena...',
  localPlayerId: null,
  localTeamId: null,
  isConnected: false,
  selectedGuess: null,
  pickLocked: false,
  matchOver: null,
  duelEnded: false,
}

export const useGameplayStore = create<GameplayState>()(
  subscribeWithSelector((set) => ({
    ...initialState,

    setSnapshot: (snapshot) => set({ snapshot }),
    setConfig: (config) => set({ config }),
    setCurrentState: (currentState) => set({ currentState }),
    setTeams: (teams) => set({ teams }),
    setPlayerUsernames: (playerUsernames) => set({ playerUsernames }),
    setMyDuel: (myDuel) =>
      set({
        myDuel,
        myDuelId: myDuel?.duelId ?? null,
        ballDeadlineEpochMs: myDuel?.ballOpen
          ? myDuel.ballDeadlineEpochMs
          : null,
      }),
    setMyDuelId: (myDuelId) => set({ myDuelId }),
    setBallDeadline: (ballDeadlineEpochMs) => set({ ballDeadlineEpochMs }),
    setStatusMessage: (statusMessage) => set({ statusMessage }),
    setLocalPlayerId: (localPlayerId) => set({ localPlayerId }),
    setLocalTeamId: (localTeamId) => set({ localTeamId }),
    setConnected: (isConnected) => set({ isConnected }),
    setSelectedGuess: (selectedGuess) => set({ selectedGuess }),
    setPickLocked: (pickLocked) => set({ pickLocked }),
    setMatchOver: (matchOver) => set({ matchOver }),
    setDuelEnded: (duelEnded) => set({ duelEnded }),
    reset: () => set(initialState),
  })),
)

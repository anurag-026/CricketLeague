import type { DuelStateDto, DuelStatus, MatchGameEvent, MatchLiveStateResponse } from '@/shared/types'
import { fetchMatchState } from '../api'
import { useGameplayStore } from '../store'

function isMyDuel(duelId: string): boolean {
  const mine = useGameplayStore.getState().myDuelId
  return mine === duelId
}

function applyDuelPatch(patch: Partial<DuelStateDto>): void {
  const { myDuel, setMyDuel } = useGameplayStore.getState()
  if (!myDuel) return
  setMyDuel({ ...myDuel, ...patch })
}

export function applyMatchEvent(event: MatchGameEvent): void {
  const store = useGameplayStore.getState()
  const {
    setSnapshot,
    setConfig,
    setCurrentState,
    setTeams,
    setPlayerUsernames,
    setMyDuelId,
    setBallDeadline,
    setStatusMessage,
    setSelectedGuess,
    setPickLocked,
    setMatchOver,
    setDuelEnded,
    localPlayerId,
  } = store

  switch (event.eventType) {
    case 'MATCH_START': {
      setConfig(event.config)
      setTeams(event.teams)
      setPlayerUsernames(event.playerUsernames ?? {})
      setCurrentState(event.currentState)
      setMatchOver(null)
      setDuelEnded(false)
      if (localPlayerId) {
        const pairing = event.duels.find(
          (d) => d.playerA === localPlayerId || d.playerB === localPlayerId,
        )
        setMyDuelId(pairing?.duelId ?? null)
      }
      setStatusMessage('Pick your number — 6 seconds per ball')
      break
    }
    case 'BALL_OPEN': {
      if (!isMyDuel(event.duelId)) break
      if (!store.myDuel) {
        void fetchMatchState(event.matchId).then(hydrateFromLiveState)
      }
      setBallDeadline(event.deadlineEpochMs)
      applyDuelPatch({
        ballOpen: true,
        ballDeadlineEpochMs: event.deadlineEpochMs,
        ballsRemaining: event.ballsRemaining,
        battingPlayerId: event.batsmanId,
        bowlingPlayerId: event.bowlerId,
      })
      setCurrentState({
        battingTeam:
          event.batsmanId === store.myDuel?.playerA ? 'TEAM_A' : 'TEAM_B',
        currentBatsman: event.batsmanId,
        currentBowler: event.bowlerId,
      })
      setSelectedGuess(null)
      setPickLocked(false)
      setStatusMessage('Choose 1–6 now!')
      break
    }
    case 'BALL_RESOLVED': {
      if (!isMyDuel(event.duelId)) {
        if (store.snapshot) {
          setSnapshot({
            ...store.snapshot,
            teamAScore: event.duelScoreA,
            teamBScore: event.duelScoreB,
            teamAWickets: event.teamAWickets,
            teamBWickets: event.teamBWickets,
          })
        }
        break
      }
      setBallDeadline(null)
      applyDuelPatch({
        ballOpen: false,
        scoreA: event.duelScoreA,
        scoreB: event.duelScoreB,
        battingPlayerId: event.battingPlayerId,
        bowlingPlayerId: event.bowlingPlayerId,
        ballsRemaining: event.ballsRemaining,
        lastBatsmanPick: event.batsmanPick,
        lastBowlerPick: event.bowlerPick,
        lastRunsOnBall: event.runsOnBall,
        lastBallWicket: event.wicket,
        lastBatsmanMissed: event.batsmanMissed,
        lastBowlerMissed: event.bowlerMissed,
        teamABallMarks: event.teamABallMarks,
        teamBBallMarks: event.teamBBallMarks,
        playerAOut: event.playerAOut,
        playerBOut: event.playerBOut,
        status: event.duelStatus as DuelStatus,
      })
      setCurrentState({
        battingTeam:
          event.battingPlayerId === store.myDuel?.playerA ? 'TEAM_A' : 'TEAM_B',
        currentBatsman: event.battingPlayerId,
        currentBowler: event.bowlingPlayerId,
      })
      setSelectedGuess(null)
      setPickLocked(false)
      if (store.snapshot) {
        setSnapshot({
          ...store.snapshot,
          teamAScore: event.duelScoreA,
          teamBScore: event.duelScoreB,
          teamAWickets: event.teamAWickets,
          teamBWickets: event.teamBWickets,
          ballsRemainingInInnings: event.ballsRemaining,
          teamABallMarks: event.teamABallMarks,
          teamBBallMarks: event.teamBBallMarks,
        })
      }
      setDuelEnded(event.duelStatus !== 'ACTIVE')
      const batLabel = event.batsmanMissed ? 'M' : String(event.batsmanPick ?? '—')
      const bowlLabel = event.bowlerMissed ? 'M' : String(event.bowlerPick ?? '—')
      const iGotOut =
        event.wicket &&
        store.localPlayerId != null &&
        store.localPlayerId === event.bowlingPlayerId
      setStatusMessage(
        event.wicket
          ? iGotOut
            ? `Wicket! ${batLabel} = ${bowlLabel} — you're out, opponent batting`
            : `Wicket! ${batLabel} = ${bowlLabel} — opponent out, your turn to bat`
          : `Ball: bat ${batLabel} · bowl ${bowlLabel} → ${event.runsOnBall} run(s)`,
      )
      break
    }
    case 'DUEL_ENDED': {
      if (!isMyDuel(event.duelId)) {
        if (store.snapshot) {
          setSnapshot({
            ...store.snapshot,
            teamAScore: event.teamAScore,
            teamBScore: event.teamBScore,
          })
        }
        break
      }
      setDuelEnded(true)
      setBallDeadline(null)
      applyDuelPatch({
        ballOpen: false,
        scoreA: event.duelScoreA,
        scoreB: event.duelScoreB,
        status: event.forfeit ? 'FORFEITED' : 'COMPLETED',
      })
      if (store.snapshot) {
        setSnapshot({
          ...store.snapshot,
          teamAScore: event.teamAScore,
          teamBScore: event.teamBScore,
        })
      }
      setStatusMessage(
        event.forfeit ? 'Your duel ended (forfeit)' : 'Your duel is over',
      )
      break
    }
    case 'MATCH_OVER':
      setMatchOver(event)
      setStatusMessage(
        event.winner == null ||
        event.finalScores.TEAM_A.runs === event.finalScores.TEAM_B.runs
          ? 'Match over — Draw'
          : `Match over — ${event.winMargin}`,
      )
      break
    default:
      break
  }
}

export function hydrateFromLiveState(state: MatchLiveStateResponse): void {
  const store = useGameplayStore.getState()
  store.setSnapshot({
    ...state.scoreboard,
    teamABallMarks: state.scoreboard.teamABallMarks ?? [],
    teamBBallMarks: state.scoreboard.teamBBallMarks ?? [],
  })
  store.setConfig(state.config)
  store.setCurrentState(state.currentState)
  store.setTeams(state.teams)
  store.setPlayerUsernames(state.playerUsernames ?? {})
  store.setMyDuel(state.myDuel)
  store.setDuelEnded(state.myDuel?.status !== 'ACTIVE')
  if (state.myDuel?.ballOpen) {
    store.setBallDeadline(state.myDuel.ballDeadlineEpochMs)
    store.setPickLocked(false)
    store.setSelectedGuess(null)
  } else {
    store.setPickLocked(false)
  }
  if (state.phase === 'MATCH_OVER') {
    store.setStatusMessage('Match over')
  } else if (state.myDuel?.ballOpen) {
    store.setStatusMessage('Choose 1–6 now!')
  } else if (state.myDuel?.lastBatsmanPick != null) {
    store.setStatusMessage(
      `Last ball: ${state.myDuel.lastBatsmanPick} vs ${state.myDuel.lastBowlerPick}`,
    )
  } else {
    store.setStatusMessage('Waiting for next ball…')
  }
}

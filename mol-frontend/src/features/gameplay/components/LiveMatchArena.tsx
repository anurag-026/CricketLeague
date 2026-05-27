import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '@/app/store'
import {
  fetchMatchState,
  forfeitMatch,
  leaveMatch,
  submitNumber,
} from '@/features/gameplay/api'
import { displayNameFor } from '@/features/gameplay/lib/displayName'
import { hydrateFromLiveState } from '@/features/gameplay/lib/matchEvents'
import { teamLabelsForDuel } from '@/features/gameplay/lib/teamLabels'
import { useGameSocket } from '@/features/gameplay/hooks/useGameSocket'
import { useShotClock } from '@/features/gameplay/hooks/useShotClock'
import { useGameplayStore } from '@/features/gameplay/store'
import type { LobbyLocationState } from '@/shared/types'
import { ArenaHeader } from './ArenaHeader'
import { ArenaScoreboard } from './ArenaScoreboard'
import { BallReveal } from './BallReveal'
import { HexGuessGrid } from './HexGuessGrid'
import { MatchOverOverlay } from './MatchOverOverlay'
import { MatchStatusPill } from './MatchStatusPill'
import { PlayerDuel } from './PlayerDuel'
import { ShotClock } from './ShotClock'

const BOWLER_PLACEHOLDER =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCqZe33_WCqk__UM0IlUZ0tyr3ru-_RQlMak65zfGrNL4KAQTbhqjmHFFJB5IjlglNdvw9mOCv-IPVgmJC7nUyiZCN9lMWVoX_fybbPCSE4qqgp8Zitt9WsPuhT1Q2FZ1GKwD4qFR3F0diRWc3kIgQm33pbCYrSkQYEUCuKrZRCNbg3OPEt3ZgyYtaFoLpkT_dLe9afzYi2_4aJKml_yy9q0K6vkpPdCP-UC0TdWW4iWhYapIh-NMccozEcRzJNA9DOANYHft4cBCM'

const BATTER_PLACEHOLDER =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCkxge2xiw_G5bKZblWC4zSrqLi8it-7771NMKSYZAM-JKUUEayxyAsgrQH_GBf90Kzf1tji_CJl7Nf-4ytnuDwIJYnOPien1mMELC3BrWUqLD249kfeyM9bLn9Xw2PiRMdCImS9EFm2c7fyOLctV4bKUKCyADeJ7VIYYoe6UQsx15Ui0J64NWh0kObdm2bAYLL9Hzf7OGYt2uE8-rL02RVG9cATUNG3h2SLjcvSl3eJHIjNSq_vrGwZ1dKtJJ9o_gQ_DWn5oLR7gI'

export function LiveMatchArena() {
  const { matchId = '' } = useParams<{ matchId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const lobbyState = (location.state as LobbyLocationState | null) ?? {}
  const user = useAppStore((s) => s.user)
  const [leaving, setLeaving] = useState(false)

  const snapshot = useGameplayStore((s) => s.snapshot)
  const config = useGameplayStore((s) => s.config)
  const myDuel = useGameplayStore((s) => s.myDuel)
  const playerUsernames = useGameplayStore((s) => s.playerUsernames)
  const ballDeadlineEpochMs = useGameplayStore((s) => s.ballDeadlineEpochMs)
  const statusMessage = useGameplayStore((s) => s.statusMessage)
  const selectedGuess = useGameplayStore((s) => s.selectedGuess)
  const isConnected = useGameplayStore((s) => s.isConnected)
  const matchOver = useGameplayStore((s) => s.matchOver)
  const duelEnded = useGameplayStore((s) => s.duelEnded)
  const localTeamId = useGameplayStore((s) => s.localTeamId)
  const pickLocked = useGameplayStore((s) => s.pickLocked)
  const setSelectedGuess = useGameplayStore((s) => s.setSelectedGuess)
  const setPickLocked = useGameplayStore((s) => s.setPickLocked)

  useGameSocket({ matchId, enabled: Boolean(matchId) })

  const canInteract = useMemo(() => {
    if (!user?.userId || !myDuel || matchOver || duelEnded || pickLocked) return false
    if (!myDuel.ballOpen) return false
    if (myDuel.status !== 'ACTIVE') return false

    const id = user.userId
    const iAmBatting = id === myDuel.battingPlayerId
    const iAmBowling = id === myDuel.bowlingPlayerId
    if (!iAmBatting && !iAmBowling) return false

    const iAmPlayerA = id === myDuel.playerA
    const iAmBatterOut = iAmPlayerA ? myDuel.playerAOut : myDuel.playerBOut
    if (iAmBatting && iAmBatterOut) return false

    return true
  }, [duelEnded, matchOver, myDuel, pickLocked, user?.userId])

  const { secondsLeft, totalSegments, filledSegments } = useShotClock({
    deadlineEpochMs: myDuel?.ballOpen ? ballDeadlineEpochMs : null,
  })

  const myDuelScoreLabel = useMemo(() => {
    if (!myDuel || !user?.userId) return null
    const mine =
      user.userId === myDuel.playerA
        ? myDuel.scoreA
        : user.userId === myDuel.playerB
          ? myDuel.scoreB
          : 0
    const theirs =
      user.userId === myDuel.playerA ? myDuel.scoreB : myDuel.scoreA
    return `Your duel: ${mine} – ${theirs}`
  }, [myDuel, user?.userId])

  useEffect(() => {
    if (user?.userId) {
      const store = useGameplayStore.getState()
      store.setLocalPlayerId(user.userId)
      if (lobbyState.team) store.setLocalTeamId(lobbyState.team)
    }
  }, [lobbyState.team, user?.userId])

  useEffect(() => {
    if (!matchId) return
    void (async () => {
      try {
        const live = await fetchMatchState(matchId)
        hydrateFromLiveState(live)
      } catch {
        useGameplayStore.getState().setStatusMessage('Waiting for live match data…')
      }
    })()
    return () => useGameplayStore.getState().reset()
  }, [matchId])

  const { teamA: teamALabel, teamB: teamBLabel } = useMemo(
    () => teamLabelsForDuel(myDuel, user?.userId, playerUsernames),
    [myDuel, playerUsernames, user?.userId],
  )

  const players = useMemo(() => {
    if (!myDuel || !user?.userId) {
      return { left: null, right: null }
    }

    const meId = user.userId
    const opponentId = meId === myDuel.playerA ? myDuel.playerB : myDuel.playerA
    const iAmOut = meId === myDuel.playerA ? myDuel.playerAOut : myDuel.playerBOut
    const iAmBatting = meId === myDuel.battingPlayerId
    const iAmBowling = meId === myDuel.bowlingPlayerId
    const opponentBatting = opponentId === myDuel.battingPlayerId
    const opponentBowling = opponentId === myDuel.bowlingPlayerId
    const opponentOut = opponentId === myDuel.playerA ? myDuel.playerAOut : myDuel.playerBOut

    const meRole = iAmBatting ? 'batter' : 'bowler'
    const opponentRole = opponentBatting ? 'batter' : 'bowler'

    return {
      left: {
        displayName: displayNameFor(meId, user.userId, playerUsernames),
        role: meRole as 'bowler' | 'batter',
        statLabel: 'YOU',
        statValue: iAmOut && !iAmBowling ? 'OUT' : iAmBatting ? 'BAT' : iAmBowling ? 'BOWL' : '—',
        imageUrl: meRole === 'batter' ? BATTER_PLACEHOLDER : BOWLER_PLACEHOLDER,
        isActive: Boolean(myDuel.ballOpen && !iAmOut && (iAmBatting || iAmBowling)),
      },
      right: {
        displayName: displayNameFor(opponentId, user.userId, playerUsernames),
        role: opponentRole as 'bowler' | 'batter',
        statLabel: 'FOE',
        statValue:
          opponentOut && !opponentBowling
            ? 'OUT'
            : opponentBatting
              ? 'BAT'
              : opponentBowling
                ? 'BOWL'
                : '—',
        imageUrl: opponentRole === 'batter' ? BATTER_PLACEHOLDER : BOWLER_PLACEHOLDER,
        isActive: Boolean(
          myDuel.ballOpen && !opponentOut && (opponentBatting || opponentBowling),
        ),
      },
    }
  }, [myDuel, playerUsernames, user])

  async function exitMatch(forfeit: boolean) {
    if (!matchId || leaving) return
    setLeaving(true)
    try {
      if (forfeit) {
        await forfeitMatch(matchId)
      } else {
        await leaveMatch(matchId)
      }
    } catch {
      // still navigate away
    } finally {
      navigate('/dashboard', { replace: true })
    }
  }

  function handleGuess(value: number) {
    if (!canInteract || !matchId || !user?.userId || pickLocked) return
    setSelectedGuess(value)
    setPickLocked(true)
    useGameplayStore.getState().setStatusMessage('Locked in — ball resolves when timer ends')
    submitNumber(matchId, {
      actionType: 'SUBMIT_NUMBER',
      playerId: user.userId,
      numberChosen: value,
    })
  }

  if (!snapshot || !config) {
    return (
      <div className="arena-match-bg flex min-h-dvh items-center justify-center text-on-surface-variant">
        Syncing arena…
      </div>
    )
  }

  const teamMode = config.teamSize > 1

  return (
    <div className="arena-match-bg relative flex min-h-dvh max-h-dvh flex-col overflow-hidden text-on-background">
      <ArenaHeader
        pingMs={isConnected ? 12 : 99}
        leaving={leaving}
        onLeave={() => void exitMatch(false)}
        onForfeit={
          !matchOver && !duelEnded ? () => void exitMatch(true) : undefined
        }
      />

      <main className="safe-bottom relative z-10 mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col px-margin-mobile pt-14 pb-3 sm:pt-16 sm:pb-4">
        <div className="w-full shrink-0">
          <ArenaScoreboard
            snapshot={snapshot}
            config={config}
            myDuel={myDuel}
            teamALabel={teamMode ? 'Team A' : teamALabel}
            teamBLabel={teamMode ? 'Team B' : teamBLabel}
          />
          {teamMode && myDuelScoreLabel && (
            <p className="-mt-2 mb-2 text-center font-mono text-[10px] tracking-wide text-on-surface-variant sm:-mt-4 sm:mb-4 sm:text-xs">
              {myDuelScoreLabel}
              <span className="mx-1 text-outline sm:mx-2">·</span>
              <span className="hidden sm:inline">Team totals (finished duels only)</span>
              <span className="sm:hidden">Team totals</span>
            </p>
          )}
        </div>

        <div className="relative flex min-h-0 w-full flex-1 flex-col items-center overflow-y-auto overscroll-contain py-2">
          <MatchStatusPill message={statusMessage.toUpperCase()} />
          {players.left && players.right && (
            <PlayerDuel left={players.left} right={players.right} />
          )}
          <BallReveal
            batsmanPick={myDuel?.lastBatsmanPick ?? null}
            bowlerPick={myDuel?.lastBowlerPick ?? null}
            batsmanMissed={myDuel?.lastBatsmanMissed}
            bowlerMissed={myDuel?.lastBowlerMissed}
            wicket={myDuel?.lastBallWicket ?? false}
            runs={myDuel?.lastRunsOnBall ?? null}
          />
        </div>

        <div className="relative z-20 mx-auto w-full max-w-md shrink-0 pt-1">
          {myDuel?.ballOpen && (
            <ShotClock
              secondsLeft={secondsLeft}
              totalSegments={totalSegments}
              filledSegments={filledSegments}
            />
          )}
          <HexGuessGrid
            selected={selectedGuess}
            disabled={!canInteract}
            onSelect={handleGuess}
          />
          {duelEnded && !matchOver && teamMode && (
            <p className="mt-2 text-center text-[10px] text-on-surface-variant sm:mt-3 sm:text-xs">
              Your 1v1 is done. Teammates still playing — team score updates when
              all duels finish.
            </p>
          )}
          {!canInteract && !matchOver && !duelEnded && (
            <p className="mt-2 text-center text-[10px] text-on-surface-variant sm:mt-3 sm:text-xs">
              {pickLocked && myDuel?.ballOpen
                ? `Locked in — result in ${secondsLeft}s`
                : myDuel?.ballOpen
                  ? 'Choose 1–6 now!'
                  : 'Waiting for next ball…'}
            </p>
          )}
        </div>
      </main>

      {matchOver && (
        <MatchOverOverlay event={matchOver} localTeamId={localTeamId} />
      )}
    </div>
  )
}

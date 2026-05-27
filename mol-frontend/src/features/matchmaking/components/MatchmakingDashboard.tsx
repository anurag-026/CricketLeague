import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/app/store'
import {
  createRoom,
  getActiveMatch,
  joinQueue,
  joinRoom,
} from '@/features/matchmaking/api'
import type { ApiError } from '@/shared/types'
import { ActionCard } from './ActionCard'
import { GlobalMatchmakingCard } from './GlobalMatchmakingCard'
import { HostRoomDialog, type HostRoomConfig } from './HostRoomDialog'
import { JoinCodeDialog } from './JoinCodeDialog'
import { PlayerStatusBar } from './PlayerStatusBar'

type LoadingAction = 'queue' | 'host' | 'join' | null

function navigateToLobby(
  navigate: ReturnType<typeof useNavigate>,
  path: string,
  state: Record<string, unknown>,
) {
  navigate(path, { state })
}

function navigateToMatch(
  navigate: ReturnType<typeof useNavigate>,
  matchId: string,
  state: Record<string, unknown>,
) {
  navigate(`/match/${matchId}`, { replace: true, state })
}

export function MatchmakingDashboard() {
  const navigate = useNavigate()
  const user = useAppStore((s) => s.user)
  const displayName = user?.username ?? 'Agent'

  const [loadingAction, setLoadingAction] = useState<LoadingAction>(null)
  const [estimatedWait, setEstimatedWait] = useState(10)
  const [hostDialogOpen, setHostDialogOpen] = useState(false)
  const [joinDialogOpen, setJoinDialogOpen] = useState(false)
  const [joinError, setJoinError] = useState<string | null>(null)
  const [hostError, setHostError] = useState<string | null>(null)
  const [bannerError, setBannerError] = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      try {
        const active = await getActiveMatch()
        if (active.inMatch && active.matchId) {
          navigateToMatch(navigate, active.matchId, { mode: 'resume' })
        }
      } catch {
        // ignore — user can start fresh
      }
    })()
  }, [navigate])

  async function handleGlobalMatchmaking() {
    setBannerError(null)
    setLoadingAction('queue')
    try {
      const res = await joinQueue()
      setEstimatedWait(res.estimatedWaitTimeSeconds)
      navigateToLobby(navigate, '/lobby', {
        mode: 'queue',
        estimatedWait: res.estimatedWaitTimeSeconds,
      })
    } catch (err) {
      setBannerError((err as ApiError).error ?? 'Could not join matchmaking queue')
    } finally {
      setLoadingAction(null)
    }
  }

  async function handleHostSubmit(config: HostRoomConfig) {
    setHostError(null)
    setLoadingAction('host')
    try {
      const res = await createRoom(config)
      setHostDialogOpen(false)
      navigateToLobby(navigate, `/lobby/${res.roomCode}`, {
        mode: 'host',
        matchId: res.matchId,
        expiresIn: res.expiresIn,
        team: 'TEAM_A',
      })
    } catch (err) {
      setHostError((err as ApiError).error ?? 'Could not create room')
    } finally {
      setLoadingAction(null)
    }
  }

  async function handleJoinCode(roomCode: string) {
    setJoinError(null)
    setLoadingAction('join')
    try {
      const res = await joinRoom(roomCode)
      setJoinDialogOpen(false)
      if (res.matchStarted) {
        navigateToMatch(navigate, res.matchId, {
          mode: 'join',
          team: res.teamAssigned,
          roomCode,
        })
      } else {
        navigateToLobby(navigate, `/lobby/${roomCode}`, {
          mode: 'join',
          matchId: res.matchId,
          team: res.teamAssigned,
        })
      }
    } catch (err) {
      setJoinError((err as ApiError).error ?? 'Invalid or expired room code')
    } finally {
      setLoadingAction(null)
    }
  }

  return (
    <>
      <PlayerStatusBar playerName={displayName} />

      {bannerError && (
        <p
          role="alert"
          className="rounded-lg border border-error/40 bg-error-container/20 px-4 py-3 text-center text-sm text-error"
        >
          {bannerError}
        </p>
      )}

      <div className="relative z-10 flex w-full flex-col gap-6">
        <GlobalMatchmakingCard
          estimatedWaitSeconds={estimatedWait}
          isLoading={loadingAction === 'queue'}
          onClick={handleGlobalMatchmaking}
        />

        <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
          <ActionCard
            title="Host Custom Match"
            description="Choose 1v1–3v3 and overs, then share the lobby code."
            icon="stadium"
            accent="cyan"
            iconClassName="text-primary-fixed"
            isLoading={loadingAction === 'host'}
            onClick={() => {
              setHostError(null)
              setHostDialogOpen(true)
            }}
          />
          <ActionCard
            title="Join via Secure Code"
            description="Enter a private lobby code to join a custom game."
            icon="vpn_key"
            accent="purple"
            iconClassName="text-secondary-fixed"
            isLoading={loadingAction === 'join' && joinDialogOpen}
            onClick={() => {
              setJoinError(null)
              setJoinDialogOpen(true)
            }}
          />
        </div>
      </div>

      <HostRoomDialog
        open={hostDialogOpen}
        isLoading={loadingAction === 'host'}
        error={hostError}
        onClose={() => {
          if (loadingAction !== 'host') setHostDialogOpen(false)
        }}
        onSubmit={handleHostSubmit}
      />

      {joinDialogOpen && (
        <JoinCodeDialog
          isLoading={loadingAction === 'join'}
          error={joinError}
          onClose={() => {
            if (loadingAction !== 'join') {
              setJoinError(null)
              setJoinDialogOpen(false)
            }
          }}
          onSubmit={handleJoinCode}
        />
      )}
    </>
  )
}

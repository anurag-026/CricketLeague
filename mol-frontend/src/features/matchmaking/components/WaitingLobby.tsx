import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { getActiveMatch, getRoomStatus, leaveQueue } from '@/features/matchmaking/api'
import { useLobbyMatch } from '@/features/matchmaking/hooks/useLobbyMatch'
import type { ApiError, LobbyLocationState, RoomStatusResponse } from '@/shared/types'
import { LobbyCodeBox } from './LobbyCodeBox'
import { LobbyTopBar } from './LobbyTopBar'
import { RadarScanner } from './RadarScanner'

const POLL_MS = 3000

export function WaitingLobby() {
  const navigate = useNavigate()
  const { roomCode: roomCodeParam } = useParams<{ roomCode?: string }>()
  const location = useLocation()
  const state = (location.state as LobbyLocationState | null) ?? {}

  const matchId = state.matchId
  const mode = state.mode

  const roomCode = useMemo(() => {
    const code = roomCodeParam?.trim().toUpperCase()
    if (!code || code === 'QUEUE') return undefined
    return code
  }, [roomCodeParam])

  const [roomStatus, setRoomStatus] = useState<RoomStatusResponse | null>(null)
  const [pollError, setPollError] = useState<string | null>(null)

  const { goToArena } = useLobbyMatch({
    matchId,
    team: state.team,
    roomCode,
    enabled: Boolean(matchId),
  })

  const pollRoom = useCallback(async () => {
    if (!roomCode) return
    try {
      const status = await getRoomStatus(roomCode)
      setRoomStatus(status)
      setPollError(null)
      if (status.status === 'STARTED' && status.matchId) {
        goToArena(status.matchId, { mode })
      }
    } catch (err) {
      setPollError((err as ApiError).error ?? 'Could not load room status')
    }
  }, [goToArena, mode, roomCode])

  useEffect(() => {
    if (!roomCode) return
    const initial = window.setTimeout(() => void pollRoom(), 0)
    const id = window.setInterval(() => void pollRoom(), POLL_MS)
    return () => {
      window.clearTimeout(initial)
      window.clearInterval(id)
    }
  }, [pollRoom, roomCode])

  useEffect(() => {
    if (mode !== 'queue') return
    const pollActive = async () => {
      try {
        const active = await getActiveMatch()
        if (active.inMatch && active.matchId) {
          goToArena(active.matchId, { mode: 'queue' })
        }
      } catch {
        // keep polling
      }
    }
    void pollActive()
    const id = window.setInterval(() => void pollActive(), POLL_MS)
    return () => window.clearInterval(id)
  }, [goToArena, mode])

  const statusText = useMemo(() => {
    if (mode === 'queue') {
      return state.estimatedWait
        ? `Scanning for challenger… (~${state.estimatedWait}s)`
        : 'Scanning for challenger…'
    }
    if (roomStatus) {
      return `${roomStatus.playersJoined}/${roomStatus.playersRequired} agents ready`
    }
    return 'Scanning for challenger…'
  }, [mode, roomStatus, state.estimatedWait])

  async function handleAbort() {
    if (mode === 'queue') {
      try {
        await leaveQueue()
      } catch {
        // still leave UI
      }
    }
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="arena-lobby-bg relative flex min-h-dvh flex-col overflow-hidden text-on-background">
      <LobbyTopBar />

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-margin-mobile pt-16 pb-28">
        <RadarScanner statusText={statusText} />

        {pollError && (
          <p role="alert" className="mb-4 text-center text-sm text-error">
            {pollError}
          </p>
        )}

        {roomCode ? (
          <LobbyCodeBox roomCode={roomCode} />
        ) : (
          <p className="max-w-xs text-center text-sm text-on-surface-variant">
            Global queue active — you will enter the arena automatically when a
            match is found.
          </p>
        )}
      </main>

      <footer className="safe-bottom fixed bottom-0 z-50 flex w-full justify-center p-8">
        <button
          type="button"
          onClick={handleAbort}
          className="border-b border-error/30 pb-1 font-mono text-xs font-medium tracking-[0.15em] text-error/80 uppercase transition-all hover:text-error hover:shadow-[0_0_10px_rgba(255,180,171,0.5)]"
        >
          Abort Matchmaking
        </button>
      </footer>
    </div>
  )
}

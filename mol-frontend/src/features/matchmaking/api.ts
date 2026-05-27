import { http } from '@/shared/api/axios'
import type {
  ActiveMatchResponse,
  CreateRoomRequest,
  CreateRoomResponse,
  JoinRoomResponse,
  QueueResponse,
  RoomStatusResponse,
} from '@/shared/types'

const DEFAULT_ROOM_CONFIG: CreateRoomRequest = {
  teamSize: 1,
  overs: 5,
}

export async function createRoom(
  payload: CreateRoomRequest,
): Promise<CreateRoomResponse> {
  const { data } = await http.post<CreateRoomResponse>(
    '/api/v1/match/room',
    payload,
  )
  return data
}

export async function createRoomWithDefaults(
  overrides?: Partial<CreateRoomRequest>,
): Promise<CreateRoomResponse> {
  return createRoom({ ...DEFAULT_ROOM_CONFIG, ...overrides })
}

export async function getRoomStatus(roomCode: string): Promise<RoomStatusResponse> {
  const { data } = await http.get<RoomStatusResponse>(
    `/api/v1/match/room/${encodeURIComponent(roomCode)}`,
  )
  return data
}

export async function joinRoom(roomCode: string): Promise<JoinRoomResponse> {
  const { data } = await http.post<JoinRoomResponse>(
    `/api/v1/match/room/${encodeURIComponent(roomCode)}/join`,
  )
  return data
}

export async function joinQueue(): Promise<QueueResponse> {
  const { data } = await http.post<QueueResponse>('/api/v1/match/queue')
  return data
}

export async function leaveQueue(): Promise<void> {
  await http.delete('/api/v1/match/queue')
}

export async function getActiveMatch(): Promise<ActiveMatchResponse> {
  const { data } = await http.get<ActiveMatchResponse>('/api/v1/match/me/active')
  return data
}

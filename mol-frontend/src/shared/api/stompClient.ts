import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs'
import { getStoredToken } from '@/features/auth/utils'

const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:8080/ws/game'

type MessageHandler = (message: IMessage) => void

let client: Client | null = null
let connectionRefCount = 0
let connectPromise: Promise<void> | null = null

function buildConnectHeaders(): Record<string, string> {
  const token = getStoredToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function createClient(): Client {
  return new Client({
    brokerURL: WS_URL,
    connectHeaders: buildConnectHeaders(),
    heartbeatIncoming: 10_000,
    heartbeatOutgoing: 10_000,
    reconnectDelay: 3_000,
    debug: import.meta.env.DEV ? (msg) => console.debug('[stomp]', msg) : () => {},
  })
}

export function getStompClient(): Client {
  if (!client) {
    client = createClient()
  }
  return client
}

/** Increments refcount and ensures STOMP is connected. */
export async function acquireStomp(): Promise<void> {
  connectionRefCount += 1
  const stomp = getStompClient()
  stomp.connectHeaders = buildConnectHeaders()

  if (stomp.connected) {
    return
  }

  if (!connectPromise) {
    connectPromise = new Promise((resolve, reject) => {
      stomp.onConnect = () => {
        connectPromise = null
        resolve()
      }
      stomp.onStompError = (frame) => {
        connectPromise = null
        reject(new Error(frame.headers.message ?? 'STOMP connection failed'))
      }
      stomp.activate()
    })
  }

  await connectPromise
}

/** Decrements refcount; disconnects when zero subscribers remain. */
export function releaseStomp(): void {
  connectionRefCount = Math.max(0, connectionRefCount - 1)
  if (connectionRefCount === 0) {
    connectPromise = null
    client?.deactivate()
    client = null
  }
}

export function subscribe(
  destination: string,
  handler: MessageHandler,
): StompSubscription {
  const stomp = getStompClient()
  if (!stomp.connected) {
    throw new Error('STOMP client is not connected. Call acquireStomp() first.')
  }
  return stomp.subscribe(destination, handler)
}

export function publish(destination: string, body: unknown): void {
  const stomp = getStompClient()
  if (!stomp.connected) {
    throw new Error('STOMP client is not connected.')
  }
  stomp.publish({
    destination,
    body: JSON.stringify(body),
  })
}

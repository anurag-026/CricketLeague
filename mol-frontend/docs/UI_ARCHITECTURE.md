# MyOwnLeague — Frontend UI Architecture

Production-oriented structure for screens 1–4. Pages are placeholders until designs are provided.

## Directory layout

```
src/
├── app/                 # Router, global store, theme CSS, bootstrap
├── layouts/             # CyberLayout (nav) · ArenaLayout (fullscreen)
├── pages/               # Route-level screens (thin; compose features)
├── features/            # Domain modules (auth, matchmaking, gameplay)
└── shared/
    ├── ui/              # Design-system primitives
    ├── api/             # HTTP + STOMP clients
    ├── components/      # Cross-route helpers (ProtectedRoute, placeholders)
    ├── lib/             # cn(), utilities
    └── types/           # API-aligned TypeScript contracts
```

## Layering rules

| Layer | Responsibility |
|--------|----------------|
| `pages/` | Route params, layout choice, wire feature containers |
| `features/*/components` | Screen-specific UI (radar, hex grid, forms) |
| `shared/ui` | Stateless, reusable primitives — no API calls |
| `shared/api` | Transport only — no React |
| `app/store` | Auth session (JWT + user profile) |
| `features/gameplay/store` | High-frequency match state (isolated from app shell) |

## Component API (shared/ui)

### `HexButton`

Primary tactile control. Supports loading, icons, variants.

```tsx
<HexButton variant="primary" size="md" isLoading={pending} loadingText="Joining…">
  Enter Arena
</HexButton>
```

| Prop | Type | Default |
|------|------|---------|
| `variant` | `primary \| secondary \| ghost \| danger` | `primary` |
| `size` | `sm \| md \| lg` | `md` |
| `fullWidth` | `boolean` | `false` |
| `isLoading` | `boolean` | `false` |
| `loadingText` | `string` | — |
| `leftIcon` / `rightIcon` | `ReactNode` | — |

### `CyberInput`

Accessible labeled input with hint/error and glow focus ring.

```tsx
<CyberInput
  label="Room code"
  hint="6-character code from your friend"
  error={errors.roomCode}
  value={code}
  onChange={(e) => setCode(e.target.value)}
  autoComplete="off"
  required
/>
```

### `GlowText`

Typography with cyber glow tones.

```tsx
<GlowText as="h1" variant="display" tone="accent">MyOwnLeague</GlowText>
```

### `ScreenState`

Maps `AsyncState<T>` → loading / error / empty / children.

```tsx
<ScreenState
  state={roomsQuery}
  onRetry={refetch}
  emptyTitle="No active rooms"
  emptyDescription="Create a room or join matchmaking."
  emptyAction={{ label: 'Find match', onClick: joinQueue }}
>
  {(rooms) => <RoomList rooms={rooms} />}
</ScreenState>
```

### `LoadingState` · `EmptyState` · `ErrorState`

Use directly when you do not need the full `ScreenState` wrapper.

## Routes

| Path | Layout | Screen |
|------|--------|--------|
| `/login` | — | 1 Auth |
| `/dashboard` | Cyber | 2 Dashboard |
| `/lobby`, `/lobby/:roomCode` | Arena | 3 Lobby |
| `/match/:matchId` | Arena | 4 Match |

## Best practices

1. **Import from barrels** — `import { HexButton, ScreenState } from '@/shared/ui'`
2. **Async UI** — Model fetch state as `AsyncState<T>`; render with `ScreenState`
3. **Auth** — Never read `sessionStorage` outside `features/auth/utils.ts`
4. **Gameplay FPS** — Subscribe to `useGameplayStore` in leaf components only
5. **A11y** — Every input has a `<label>`; errors use `role="alert"`; buttons expose `aria-busy` when loading
6. **Responsive** — Mobile-first `max-w-lg` content column; `safe-top` / `safe-bottom` for notched devices

## Dev

```bash
cp .env.example .env
npm run dev
```

Vite proxies `/api` and `/ws` to `localhost:8080`.

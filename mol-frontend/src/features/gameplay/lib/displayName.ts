export function displayNameFor(
  playerId: string | null,
  localUserId: string | undefined,
  playerUsernames: Record<string, string> | null,
): string {
  if (!playerId) return 'Player'
  if (localUserId && playerId === localUserId) {
    return 'You'
  }
  const name = playerUsernames?.[playerId]
  return name ?? 'Opponent'
}

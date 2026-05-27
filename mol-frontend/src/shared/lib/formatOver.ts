/** Format balls bowled as cricket overs (e.g. 4.2 = 4 overs, 2 balls). */
export function formatOver(totalOvers: number, ballsRemainingInInnings: number): string {
  const totalBalls = totalOvers * 6
  const bowled = Math.max(0, totalBalls - ballsRemainingInInnings)
  const overs = Math.floor(bowled / 6)
  const balls = bowled % 6
  return `${overs}.${balls}`
}

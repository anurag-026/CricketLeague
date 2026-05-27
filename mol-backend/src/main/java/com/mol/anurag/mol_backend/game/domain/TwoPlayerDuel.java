package com.mol.anurag.mol_backend.game.domain;

import com.mol.anurag.mol_backend.match.model.TeamId;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

/** Head-to-head 1v1 within a match (used for pure 1v1 and each team pairing). */
public class TwoPlayerDuel {

    private UUID duelId;
    private UUID matchId;
    private UUID playerA;
    private UUID playerB;
    private UUID battingPlayerId;
    private UUID bowlingPlayerId;
    private int scoreA;
    private int scoreB;
    private int ballsRemaining;
    private int totalOvers;
    private Integer pendingBatsmanPick;
    private Integer pendingBowlerPick;
    private long ballDeadlineEpochMs;
    private boolean ballOpen;
    private Integer lastBatsmanPick;
    private Integer lastBowlerPick;
    private Integer lastRunsOnBall;
    private boolean lastBallWicket;
    private boolean lastBatsmanMissed;
    private boolean lastBowlerMissed;
    private boolean playerAOut;
    private boolean playerBOut;
    private int playerAConsecutiveMisses;
    private int playerBConsecutiveMisses;
    private List<DuelBallRecord> ballHistory = new ArrayList<>();
    private List<String> teamACurrentOverMarks = new ArrayList<>();
    private List<String> teamBCurrentOverMarks = new ArrayList<>();
    private DuelStatus status = DuelStatus.ACTIVE;
    private TeamId winnerTeam;

    public static TwoPlayerDuel create(
            UUID matchId, UUID playerA, UUID playerB, int totalOvers) {
        TwoPlayerDuel duel = new TwoPlayerDuel();
        duel.duelId = UUID.randomUUID();
        duel.matchId = matchId;
        duel.playerA = playerA;
        duel.playerB = playerB;
        duel.totalOvers = totalOvers;
        duel.ballsRemaining = totalOvers * 6;
        duel.battingPlayerId = playerA;
        duel.bowlingPlayerId = playerB;
        return duel;
    }

    public boolean involves(UUID playerId) {
        return playerId.equals(playerA) || playerId.equals(playerB);
    }

    public UUID opponentOf(UUID playerId) {
        return playerId.equals(playerA) ? playerB : playerA;
    }

    public TeamId teamOf(UUID playerId) {
        return playerId.equals(playerA) ? TeamId.TEAM_A : TeamId.TEAM_B;
    }

    public boolean isBatting(UUID playerId) {
        return playerId.equals(battingPlayerId);
    }

    public boolean isBowling(UUID playerId) {
        return playerId.equals(bowlingPlayerId);
    }

    public void swapRoles() {
        UUID temp = battingPlayerId;
        battingPlayerId = bowlingPlayerId;
        bowlingPlayerId = temp;
    }

    public boolean isPlayerOut(UUID playerId) {
        if (playerId.equals(playerA)) {
            return playerAOut;
        }
        if (playerId.equals(playerB)) {
            return playerBOut;
        }
        return false;
    }

    public void dismissBatsman(UUID batsmanId) {
        if (batsmanId.equals(playerA)) {
            playerAOut = true;
        } else if (batsmanId.equals(playerB)) {
            playerBOut = true;
        }
    }

    public boolean bothBattersOut() {
        return playerAOut && playerBOut;
    }

    public boolean isPlayerAOut() {
        return playerAOut;
    }

    public boolean isPlayerBOut() {
        return playerBOut;
    }

    public int ballsPlayed() {
        return totalOvers * 6 - ballsRemaining;
    }

    /** Ball number within the current over (1–6) for the next ball to be bowled. */
    public int ballInOverIndex() {
        return (ballsPlayed() % 6) + 1;
    }

    public void recordBall(DuelBallRecord record) {
        ballHistory.add(record);
        if (record.getBallInOver() == 1) {
            teamACurrentOverMarks.clear();
            teamBCurrentOverMarks.clear();
        }
        teamACurrentOverMarks.add(record.markForPlayer(playerA));
        teamBCurrentOverMarks.add(record.markForPlayer(playerB));
    }

    /** Batting round: 1 = opening innings, 2 = chase after first wicket. */
    public int battingRound() {
        return playerAOut || playerBOut ? 2 : 1;
    }

    public void updateMissStreak(UUID playerId, boolean missed) {
        if (playerId.equals(playerA)) {
            if (missed) {
                playerAConsecutiveMisses++;
            } else {
                playerAConsecutiveMisses = 0;
            }
        } else if (playerId.equals(playerB)) {
            if (missed) {
                playerBConsecutiveMisses++;
            } else {
                playerBConsecutiveMisses = 0;
            }
        }
    }

    public int getConsecutiveMisses(UUID playerId) {
        if (playerId.equals(playerA)) {
            return playerAConsecutiveMisses;
        }
        if (playerId.equals(playerB)) {
            return playerBConsecutiveMisses;
        }
        return 0;
    }

    public boolean hasReachedAfkLimit(UUID playerId, int limit) {
        return getConsecutiveMisses(playerId) >= limit;
    }

    public void clearAllOverMarks() {
        teamACurrentOverMarks.clear();
        teamBCurrentOverMarks.clear();
    }

    public static List<String> paddedOverMarks(List<String> marks) {
        List<String> padded = new ArrayList<>(marks);
        while (padded.size() < 6) {
            padded.add("");
        }
        return Collections.unmodifiableList(padded.subList(0, 6));
    }

    public void addRunsToBatsman(int runs) {
        if (battingPlayerId.equals(playerA)) {
            scoreA += runs;
        } else {
            scoreB += runs;
        }
    }

    public void clearPending() {
        pendingBatsmanPick = null;
        pendingBowlerPick = null;
    }

    public boolean bothPicksReady() {
        return pendingBatsmanPick != null && pendingBowlerPick != null;
    }

    public boolean isFinished() {
        return status != DuelStatus.ACTIVE || ballsRemaining <= 0;
    }

    public UUID getDuelId() {
        return duelId;
    }

    public UUID getMatchId() {
        return matchId;
    }

    public UUID getPlayerA() {
        return playerA;
    }

    public UUID getPlayerB() {
        return playerB;
    }

    public UUID getBattingPlayerId() {
        return battingPlayerId;
    }

    public UUID getBowlingPlayerId() {
        return bowlingPlayerId;
    }

    public int getScoreA() {
        return scoreA;
    }

    public int getScoreB() {
        return scoreB;
    }

    public int getBallsRemaining() {
        return ballsRemaining;
    }

    public int getTotalOvers() {
        return totalOvers;
    }

    public Integer getPendingBatsmanPick() {
        return pendingBatsmanPick;
    }

    public void setPendingBatsmanPick(Integer pendingBatsmanPick) {
        this.pendingBatsmanPick = pendingBatsmanPick;
    }

    public Integer getPendingBowlerPick() {
        return pendingBowlerPick;
    }

    public void setPendingBowlerPick(Integer pendingBowlerPick) {
        this.pendingBowlerPick = pendingBowlerPick;
    }

    public long getBallDeadlineEpochMs() {
        return ballDeadlineEpochMs;
    }

    public void setBallDeadlineEpochMs(long ballDeadlineEpochMs) {
        this.ballDeadlineEpochMs = ballDeadlineEpochMs;
    }

    public boolean isBallOpen() {
        return ballOpen;
    }

    public void setBallOpen(boolean ballOpen) {
        this.ballOpen = ballOpen;
    }

    public Integer getLastBatsmanPick() {
        return lastBatsmanPick;
    }

    public void setLastBatsmanPick(Integer lastBatsmanPick) {
        this.lastBatsmanPick = lastBatsmanPick;
    }

    public Integer getLastBowlerPick() {
        return lastBowlerPick;
    }

    public void setLastBowlerPick(Integer lastBowlerPick) {
        this.lastBowlerPick = lastBowlerPick;
    }

    public Integer getLastRunsOnBall() {
        return lastRunsOnBall;
    }

    public void setLastRunsOnBall(Integer lastRunsOnBall) {
        this.lastRunsOnBall = lastRunsOnBall;
    }

    public boolean isLastBallWicket() {
        return lastBallWicket;
    }

    public void setLastBallWicket(boolean lastBallWicket) {
        this.lastBallWicket = lastBallWicket;
    }

    public boolean isLastBatsmanMissed() {
        return lastBatsmanMissed;
    }

    public void setLastBatsmanMissed(boolean lastBatsmanMissed) {
        this.lastBatsmanMissed = lastBatsmanMissed;
    }

    public boolean isLastBowlerMissed() {
        return lastBowlerMissed;
    }

    public void setLastBowlerMissed(boolean lastBowlerMissed) {
        this.lastBowlerMissed = lastBowlerMissed;
    }

    public DuelStatus getStatus() {
        return status;
    }

    public void setStatus(DuelStatus status) {
        this.status = status;
    }

    public TeamId getWinnerTeam() {
        return winnerTeam;
    }

    public void setWinnerTeam(TeamId winnerTeam) {
        this.winnerTeam = winnerTeam;
    }

    public void decrementBall() {
        if (ballsRemaining > 0) {
            ballsRemaining--;
        }
    }

    public List<DuelBallRecord> getBallHistory() {
        return Collections.unmodifiableList(ballHistory);
    }

    public List<String> getTeamACurrentOverMarks() {
        return teamACurrentOverMarks;
    }

    public List<String> getTeamBCurrentOverMarks() {
        return teamBCurrentOverMarks;
    }
}

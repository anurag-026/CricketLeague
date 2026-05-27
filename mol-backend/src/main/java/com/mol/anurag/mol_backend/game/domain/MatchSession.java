package com.mol.anurag.mol_backend.game.domain;

import com.mol.anurag.mol_backend.match.model.TeamId;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

public class MatchSession {

    private UUID matchId;
    private String roomCode;
    private int teamSize;
    private int totalOvers;
    private MatchSessionPhase phase = MatchSessionPhase.IN_PROGRESS;
    private List<UUID> duelIds = new ArrayList<>();
    private int teamAScore;
    private int teamBScore;
    private TeamId winnerTeam;
    private String winMargin;

    public static MatchSession create(UUID matchId, String roomCode, int teamSize, int totalOvers) {
        MatchSession session = new MatchSession();
        session.matchId = matchId;
        session.roomCode = roomCode;
        session.teamSize = teamSize;
        session.totalOvers = totalOvers;
        return session;
    }

    public void addDuel(UUID duelId) {
        duelIds.add(duelId);
    }

    public UUID findDuelIdForPlayer(List<TwoPlayerDuel> duels, UUID playerId) {
        for (TwoPlayerDuel duel : duels) {
            if (duel.involves(playerId)) {
                return duel.getDuelId();
            }
        }
        return null;
    }

    public boolean allDuelsFinished(List<TwoPlayerDuel> duels) {
        return duels.stream().allMatch(d -> d.getStatus() != DuelStatus.ACTIVE);
    }

    public void recalculateTeamScores(List<TwoPlayerDuel> duels) {
        teamAScore = 0;
        teamBScore = 0;
        for (TwoPlayerDuel duel : duels) {
            if (duel.getStatus() == DuelStatus.ACTIVE
                    || duel.getStatus() == DuelStatus.COMPLETED
                    || duel.getStatus() == DuelStatus.DRAW
                    || duel.getStatus() == DuelStatus.FORFEITED) {
                teamAScore += duel.getScoreA();
                teamBScore += duel.getScoreB();
            }
        }
    }

    public int countTeamWickets(List<TwoPlayerDuel> duels, TeamId team) {
        int count = 0;
        for (TwoPlayerDuel duel : duels) {
            if (team == TeamId.TEAM_A && duel.isPlayerAOut()) {
                count++;
            } else if (team == TeamId.TEAM_B && duel.isPlayerBOut()) {
                count++;
            }
        }
        return count;
    }

    public UUID getMatchId() {
        return matchId;
    }

    public String getRoomCode() {
        return roomCode;
    }

    public int getTeamSize() {
        return teamSize;
    }

    public int getTotalOvers() {
        return totalOvers;
    }

    public MatchSessionPhase getPhase() {
        return phase;
    }

    public void setPhase(MatchSessionPhase phase) {
        this.phase = phase;
    }

    public List<UUID> getDuelIds() {
        return Collections.unmodifiableList(duelIds);
    }

    public int getTeamAScore() {
        return teamAScore;
    }

    public int getTeamBScore() {
        return teamBScore;
    }

    public TeamId getWinnerTeam() {
        return winnerTeam;
    }

    public void setWinnerTeam(TeamId winnerTeam) {
        this.winnerTeam = winnerTeam;
    }

    public String getWinMargin() {
        return winMargin;
    }

    public void setWinMargin(String winMargin) {
        this.winMargin = winMargin;
    }
}

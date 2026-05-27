package com.mol.anurag.mol_backend.game.domain;

import com.mol.anurag.mol_backend.match.model.TeamId;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Pure domain model for live match state. No Redis or WebSocket dependencies.
 */
public class GameState {

    private UUID matchId;
    private int totalOvers;
    private int teamSize;
    private MatchPhase phase = MatchPhase.WAITING;
    private Map<TeamId, List<UUID>> teams = new HashMap<>();
    private TeamId battingTeam = TeamId.TEAM_A;
    private int innings = 1;
    private int teamAScore;
    private int teamAWickets;
    private int teamBScore;
    private int teamBWickets;
    private int ballsRemaining;
    private UUID currentBatsmanId;
    private UUID currentBowlerId;
    private Integer pendingBatsmanInput;
    private Integer pendingBowlerInput;
    private Integer firstInningsTarget;
    private int currentBowlerIndex;

    public static GameState newMatch(
            UUID matchId, int totalOvers, int teamSize, Map<TeamId, List<UUID>> teams) {
        GameState state = new GameState();
        state.matchId = matchId;
        state.totalOvers = totalOvers;
        state.teamSize = teamSize;
        state.teams = new HashMap<>(teams);
        state.phase = MatchPhase.IN_PROGRESS;
        state.ballsRemaining = totalOvers * 6;
        state.battingTeam = TeamId.TEAM_A;
        state.currentBatsmanId = teams.get(TeamId.TEAM_A).get(0);
        state.currentBowlerId = teams.get(TeamId.TEAM_B).get(0);
        state.currentBowlerIndex = 0;
        return state;
    }

    public void decrementBallsRemaining() {
        if (ballsRemaining > 0) {
            ballsRemaining--;
        }
    }

    public void addRunsToBattingTeam(int runs) {
        setBattingScore(battingScore() + runs);
    }

    public void addWicketToBattingTeam() {
        setBattingWickets(battingWickets() + 1);
    }

    /**
     * Advances to the next batsman in the batting lineup after a wicket.
     *
     * @return the new batsman id, or null if the innings is all out
     */
    public UUID rotateBatsman() {
        if (battingWickets() >= maxWickets()) {
            currentBatsmanId = null;
            return null;
        }
        List<UUID> lineup = battingLineup();
        int nextIndex = lineup.indexOf(currentBatsmanId) + 1;
        if (nextIndex >= lineup.size()) {
            currentBatsmanId = null;
            return null;
        }
        currentBatsmanId = lineup.get(nextIndex);
        return currentBatsmanId;
    }

    public void rotateBowler() {
        List<UUID> bowlers = bowlingLineup();
        currentBowlerIndex = (currentBowlerIndex + 1) % bowlers.size();
        currentBowlerId = bowlers.get(currentBowlerIndex);
    }

    public void clearPendingInputs() {
        pendingBatsmanInput = null;
        pendingBowlerInput = null;
    }

    public boolean acceptsInput() {
        return phase == MatchPhase.IN_PROGRESS;
    }

    public boolean isBatsman(UUID playerId) {
        return playerId != null && playerId.equals(currentBatsmanId);
    }

    public boolean isBowler(UUID playerId) {
        return playerId != null && playerId.equals(currentBowlerId);
    }

    public int maxWickets() {
        return teamSize - 1;
    }

    public int battingScore() {
        return battingTeam == TeamId.TEAM_A ? teamAScore : teamBScore;
    }

    public int battingWickets() {
        return battingTeam == TeamId.TEAM_A ? teamAWickets : teamBWickets;
    }

    public void setBattingScore(int score) {
        if (battingTeam == TeamId.TEAM_A) {
            teamAScore = score;
        } else {
            teamBScore = score;
        }
    }

    public void setBattingWickets(int wickets) {
        if (battingTeam == TeamId.TEAM_A) {
            teamAWickets = wickets;
        } else {
            teamBWickets = wickets;
        }
    }

    public List<UUID> battingLineup() {
        return new ArrayList<>(teams.get(battingTeam));
    }

    public List<UUID> bowlingLineup() {
        TeamId bowling = battingTeam == TeamId.TEAM_A ? TeamId.TEAM_B : TeamId.TEAM_A;
        return new ArrayList<>(teams.get(bowling));
    }

    public boolean isAllOut() {
        return battingWickets() >= maxWickets();
    }

    public boolean isInningsComplete() {
        return ballsRemaining <= 0 || isAllOut()
                || (innings == 2 && firstInningsTarget != null && battingScore() >= firstInningsTarget);
    }

    public UUID getMatchId() {
        return matchId;
    }

    public void setMatchId(UUID matchId) {
        this.matchId = matchId;
    }

    public int getTotalOvers() {
        return totalOvers;
    }

    public void setTotalOvers(int totalOvers) {
        this.totalOvers = totalOvers;
    }

    public int getTeamSize() {
        return teamSize;
    }

    public void setTeamSize(int teamSize) {
        this.teamSize = teamSize;
    }

    public MatchPhase getPhase() {
        return phase;
    }

    public void setPhase(MatchPhase phase) {
        this.phase = phase;
    }

    public Map<TeamId, List<UUID>> getTeams() {
        return teams;
    }

    public void setTeams(Map<TeamId, List<UUID>> teams) {
        this.teams = teams;
    }

    public TeamId getBattingTeam() {
        return battingTeam;
    }

    public void setBattingTeam(TeamId battingTeam) {
        this.battingTeam = battingTeam;
    }

    public int getInnings() {
        return innings;
    }

    public void setInnings(int innings) {
        this.innings = innings;
    }

    public int getTeamAScore() {
        return teamAScore;
    }

    public void setTeamAScore(int teamAScore) {
        this.teamAScore = teamAScore;
    }

    public int getTeamAWickets() {
        return teamAWickets;
    }

    public void setTeamAWickets(int teamAWickets) {
        this.teamAWickets = teamAWickets;
    }

    public int getTeamBScore() {
        return teamBScore;
    }

    public void setTeamBScore(int teamBScore) {
        this.teamBScore = teamBScore;
    }

    public int getTeamBWickets() {
        return teamBWickets;
    }

    public void setTeamBWickets(int teamBWickets) {
        this.teamBWickets = teamBWickets;
    }

    public int getBallsRemaining() {
        return ballsRemaining;
    }

    public void setBallsRemaining(int ballsRemaining) {
        this.ballsRemaining = ballsRemaining;
    }

    public UUID getCurrentBatsmanId() {
        return currentBatsmanId;
    }

    public void setCurrentBatsmanId(UUID currentBatsmanId) {
        this.currentBatsmanId = currentBatsmanId;
    }

    public UUID getCurrentBowlerId() {
        return currentBowlerId;
    }

    public void setCurrentBowlerId(UUID currentBowlerId) {
        this.currentBowlerId = currentBowlerId;
    }

    public Integer getPendingBatsmanInput() {
        return pendingBatsmanInput;
    }

    public void setPendingBatsmanInput(Integer pendingBatsmanInput) {
        this.pendingBatsmanInput = pendingBatsmanInput;
    }

    public Integer getPendingBowlerInput() {
        return pendingBowlerInput;
    }

    public void setPendingBowlerInput(Integer pendingBowlerInput) {
        this.pendingBowlerInput = pendingBowlerInput;
    }

    public Integer getFirstInningsTarget() {
        return firstInningsTarget;
    }

    public void setFirstInningsTarget(Integer firstInningsTarget) {
        this.firstInningsTarget = firstInningsTarget;
    }

    public int getCurrentBowlerIndex() {
        return currentBowlerIndex;
    }

    public void setCurrentBowlerIndex(int currentBowlerIndex) {
        this.currentBowlerIndex = currentBowlerIndex;
    }
}

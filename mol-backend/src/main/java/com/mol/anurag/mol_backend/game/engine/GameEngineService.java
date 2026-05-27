package com.mol.anurag.mol_backend.game.engine;

import com.mol.anurag.mol_backend.game.domain.BallResolution;
import com.mol.anurag.mol_backend.game.domain.BallResolutionType;
import com.mol.anurag.mol_backend.game.domain.GameState;
import com.mol.anurag.mol_backend.game.domain.InvalidMoveException;
import com.mol.anurag.mol_backend.game.domain.MatchPhase;
import com.mol.anurag.mol_backend.match.model.TeamId;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Pure domain engine for hand-cricket rules. No Redis, HTTP, or WebSocket code.
 */
@Service
public class GameEngineService {

    public static final int MIN_NUMBER = 1;
    public static final int MAX_NUMBER = 6;

    public GameState processBall(GameState state, int batsmanNumber, int bowlerNumber) {
        validateNumbers(batsmanNumber, bowlerNumber);
        if (!state.acceptsInput()) {
            throw new InvalidMoveException("Match is not accepting ball input in phase " + state.getPhase());
        }

        state.decrementBallsRemaining();

        BallResolution resolution;
        if (batsmanNumber == bowlerNumber) {
            resolution = processWicket(state, batsmanNumber, bowlerNumber);
        } else {
            resolution = processRuns(state, batsmanNumber, bowlerNumber);
        }

        applyPostBallTransitions(state, resolution);
        state.clearPendingInputs();
        return state;
    }

    public BallResolution processBallWithResult(GameState state, int batsmanNumber, int bowlerNumber) {
        validateNumbers(batsmanNumber, bowlerNumber);
        if (!state.acceptsInput()) {
            throw new InvalidMoveException("Match is not accepting ball input in phase " + state.getPhase());
        }

        state.decrementBallsRemaining();

        BallResolution resolution;
        if (batsmanNumber == bowlerNumber) {
            resolution = processWicket(state, batsmanNumber, bowlerNumber);
        } else {
            resolution = processRuns(state, batsmanNumber, bowlerNumber);
        }

        applyPostBallTransitions(state, resolution);
        state.clearPendingInputs();
        return resolution;
    }

    public void beginSecondInnings(GameState state) {
        state.setFirstInningsTarget(state.battingScore() + 1);
        state.setInnings(2);
        state.setBattingTeam(state.getBattingTeam() == TeamId.TEAM_A ? TeamId.TEAM_B : TeamId.TEAM_A);
        state.setBallsRemaining(state.getTotalOvers() * 6);
        state.setCurrentBatsmanId(state.battingLineup().get(0));
        state.setCurrentBowlerIndex(0);
        state.setCurrentBowlerId(state.bowlingLineup().get(0));
        state.clearPendingInputs();
        state.setPhase(MatchPhase.IN_PROGRESS);
    }

    public TeamId determineWinner(GameState state) {
        if (state.getTeamAScore() != state.getTeamBScore()) {
            return state.getTeamAScore() > state.getTeamBScore() ? TeamId.TEAM_A : TeamId.TEAM_B;
        }
        return state.getBattingTeam() == TeamId.TEAM_A ? TeamId.TEAM_B : TeamId.TEAM_A;
    }

    public String buildWinMargin(GameState state, TeamId winner) {
        if (winner == state.getBattingTeam() && state.getInnings() == 2) {
            int wicketsLeft = state.maxWickets() - state.battingWickets();
            return wicketsLeft + " wickets";
        }
        int marginRuns = Math.abs(state.getTeamAScore() - state.getTeamBScore());
        return marginRuns + " runs";
    }

    private BallResolution processRuns(GameState state, int batsmanNumber, int bowlerNumber) {
        state.addRunsToBattingTeam(batsmanNumber);
        if (state.isInningsComplete()) {
            return endInningsOrMatch(state, batsmanNumber, bowlerNumber, batsmanNumber, null, null);
        }
        state.rotateBowler();
        return new BallResolution(
                BallResolutionType.RUNS, batsmanNumber, bowlerNumber, batsmanNumber, null, null, null, null);
    }

    private BallResolution processWicket(GameState state, int batsmanNumber, int bowlerNumber) {
        UUID playerOut = state.getCurrentBatsmanId();
        state.addWicketToBattingTeam();
        UUID nextBatsman = state.rotateBatsman();
        if (state.isInningsComplete()) {
            return endInningsOrMatch(state, batsmanNumber, bowlerNumber, 0, playerOut, nextBatsman);
        }
        state.rotateBowler();
        return new BallResolution(
                BallResolutionType.WICKET, batsmanNumber, bowlerNumber, 0, playerOut, nextBatsman, null, null);
    }

    private BallResolution endInningsOrMatch(
            GameState state,
            int batsmanNumber,
            int bowlerNumber,
            int runsOnBall,
            UUID playerOut,
            UUID nextBatsman) {

        if (state.getInnings() == 1) {
            state.setPhase(MatchPhase.INNINGS_BREAK);
            return new BallResolution(
                    BallResolutionType.INNINGS_ENDED,
                    batsmanNumber,
                    bowlerNumber,
                    runsOnBall,
                    playerOut,
                    nextBatsman,
                    null,
                    null);
        }

        state.setPhase(MatchPhase.MATCH_OVER);
        TeamId winner = determineWinner(state);
        String margin = buildWinMargin(state, winner);
        return new BallResolution(
                BallResolutionType.MATCH_ENDED,
                batsmanNumber,
                bowlerNumber,
                runsOnBall,
                playerOut,
                nextBatsman,
                winner,
                margin);
    }

    private void applyPostBallTransitions(GameState state, BallResolution resolution) {
        if (resolution.type() == BallResolutionType.INNINGS_ENDED) {
            beginSecondInnings(state);
        }
    }

    private static void validateNumbers(int batsmanNumber, int bowlerNumber) {
        if (batsmanNumber < MIN_NUMBER
                || batsmanNumber > MAX_NUMBER
                || bowlerNumber < MIN_NUMBER
                || bowlerNumber > MAX_NUMBER) {
            throw new InvalidMoveException("Inputs must be between 1 and 6");
        }
    }
}

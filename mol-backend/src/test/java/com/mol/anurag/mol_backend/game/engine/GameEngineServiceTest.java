package com.mol.anurag.mol_backend.game.engine;

import com.mol.anurag.mol_backend.game.domain.BallResolution;
import com.mol.anurag.mol_backend.game.domain.BallResolutionType;
import com.mol.anurag.mol_backend.game.domain.GameState;
import com.mol.anurag.mol_backend.game.domain.InvalidMoveException;
import com.mol.anurag.mol_backend.game.domain.MatchPhase;
import com.mol.anurag.mol_backend.match.model.TeamId;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class GameEngineServiceTest {

    private GameEngineService engine;

    private UUID matchId;
    private UUID a1;
    private UUID a2;
    private UUID b1;
    private UUID b2;

    @BeforeEach
    void setUp() {
        engine = new GameEngineService();
        matchId = UUID.randomUUID();
        a1 = UUID.randomUUID();
        a2 = UUID.randomUUID();
        b1 = UUID.randomUUID();
        b2 = UUID.randomUUID();
    }

    @Test
    void rejectsInvalidNumbers() {
        GameState state = newMatch();
        assertThrows(InvalidMoveException.class, () -> engine.processBall(state, 0, 3));
        assertThrows(InvalidMoveException.class, () -> engine.processBall(state, 3, 7));
    }

    @Test
    void wicketOnMatchingNumbersEndsInningsForTwoPlayerTeam() {
        GameState state = newMatch();
        BallResolution resolution = engine.processBallWithResult(state, 5, 5);

        assertEquals(BallResolutionType.INNINGS_ENDED, resolution.type());
        assertEquals(1, state.getTeamAWickets());
        assertEquals(2, state.getInnings());
        assertEquals(TeamId.TEAM_B, state.getBattingTeam());
        assertEquals(MatchPhase.IN_PROGRESS, state.getPhase());
    }

    @Test
    void inningsEndsWhenBallsExhausted() {
        GameState state = newMatch();

        for (int ball = 0; ball < 30; ball++) {
            engine.processBallWithResult(state, 3, 2);
        }

        assertEquals(2, state.getInnings());
        assertEquals(TeamId.TEAM_B, state.getBattingTeam());
        assertEquals(90, state.getTeamAScore());
        assertEquals(30, state.getBallsRemaining());
        assertEquals(MatchPhase.IN_PROGRESS, state.getPhase());
    }

    @Test
    void inningsEndsOnAllOut() {
        GameState state = newMatch();
        BallResolution firstInningsEnd = engine.processBallWithResult(state, 4, 4);

        assertEquals(BallResolutionType.INNINGS_ENDED, firstInningsEnd.type());
        assertEquals(1, state.getTeamAWickets());
        assertEquals(2, state.getInnings());
        assertEquals(TeamId.TEAM_B, state.getBattingTeam());
    }

    @Test
    void fullFiveOverMatchProducesWinner() {
        GameState state = newMatch();

        for (int i = 0; i < 30; i++) {
            engine.processBallWithResult(state, 2, 1);
        }
        assertEquals(2, state.getInnings());
        assertEquals(60, state.getTeamAScore());
        assertEquals(TeamId.TEAM_B, state.getBattingTeam());

        BallResolution winningBall = null;
        for (int i = 0; i < 30; i++) {
            winningBall = engine.processBallWithResult(state, 3, 1);
            if (winningBall.type() == BallResolutionType.MATCH_ENDED) {
                break;
            }
        }

        assertNotNull(winningBall);
        assertEquals(BallResolutionType.MATCH_ENDED, winningBall.type());
        assertEquals(MatchPhase.MATCH_OVER, state.getPhase());
        assertEquals(TeamId.TEAM_B, winningBall.winner());
        assertTrue(state.getTeamBScore() >= 61);
        assertTrue(state.getTeamBScore() > state.getTeamAScore());
    }

    @Test
    void secondInningsTargetChaseEndsMatchEarly() {
        GameState state = newMatch();

        for (int i = 0; i < 30; i++) {
            engine.processBallWithResult(state, 1, 2);
        }
        assertEquals(30, state.getTeamAScore());
        assertEquals(31, state.getFirstInningsTarget());

        for (int i = 0; i < 5; i++) {
            engine.processBallWithResult(state, 6, 2);
        }
        BallResolution matchEnd = engine.processBallWithResult(state, 6, 2);

        assertEquals(BallResolutionType.MATCH_ENDED, matchEnd.type());
        assertEquals(TeamId.TEAM_B, matchEnd.winner());
        assertEquals(36, state.getTeamBScore());
    }

    private GameState newMatch() {
        return GameState.newMatch(
                matchId,
                5,
                2,
                Map.of(
                        TeamId.TEAM_A, List.of(a1, a2),
                        TeamId.TEAM_B, List.of(b1, b2)));
    }
}

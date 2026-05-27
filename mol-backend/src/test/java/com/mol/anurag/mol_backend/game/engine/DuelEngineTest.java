package com.mol.anurag.mol_backend.game.engine;

import com.mol.anurag.mol_backend.game.domain.DuelStatus;
import com.mol.anurag.mol_backend.game.domain.TwoPlayerDuel;
import com.mol.anurag.mol_backend.match.model.TeamId;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class DuelEngineTest {

    private final DuelEngine engine = new DuelEngine();

    @Test
    void resolveBall_doesNotSwapRolesOnNormalBall() {
        UUID a = UUID.randomUUID();
        UUID b = UUID.randomUUID();
        TwoPlayerDuel duel = TwoPlayerDuel.create(UUID.randomUUID(), a, b, 1);

        engine.resolveBall(duel, 4, 2);

        assertEquals(a, duel.getBattingPlayerId());
        assertEquals(b, duel.getBowlingPlayerId());
        assertEquals(4, duel.getScoreA());
        assertEquals(DuelStatus.ACTIVE, duel.getStatus());
    }

    @Test
    void resolveBall_wicketDismissesBatsmanAndSwapsRoles() {
        UUID a = UUID.randomUUID();
        UUID b = UUID.randomUUID();
        TwoPlayerDuel duel = TwoPlayerDuel.create(UUID.randomUUID(), a, b, 1);

        engine.resolveBall(duel, 5, 5);

        assertEquals(DuelStatus.ACTIVE, duel.getStatus());
        assertTrue(duel.isPlayerOut(a));
        assertFalse(duel.isPlayerOut(b));
        assertEquals(b, duel.getBattingPlayerId());
        assertEquals(a, duel.getBowlingPlayerId());
    }

    @Test
    void resolveBall_missedPickRecordsMarkM() {
        UUID a = UUID.randomUUID();
        UUID b = UUID.randomUUID();
        TwoPlayerDuel duel = TwoPlayerDuel.create(UUID.randomUUID(), a, b, 1);

        engine.resolveBall(duel, null, 3);

        assertEquals("M", duel.getTeamACurrentOverMarks().get(0));
        assertEquals("3", duel.getTeamBCurrentOverMarks().get(0));
        assertEquals(0, duel.getScoreA());
        assertFalse(duel.isPlayerOut(a));
    }

    @Test
    void resolveBall_endsWhenChaserExceedsDismissedScore() {
        UUID a = UUID.randomUUID();
        UUID b = UUID.randomUUID();
        TwoPlayerDuel duel = TwoPlayerDuel.create(UUID.randomUUID(), a, b, 2);

        engine.resolveBall(duel, 3, 3);
        assertTrue(duel.isPlayerOut(a));
        assertEquals(DuelStatus.ACTIVE, duel.getStatus());

        engine.resolveBall(duel, 4, 1);
        assertEquals(DuelStatus.COMPLETED, duel.getStatus());
        assertEquals(TeamId.TEAM_B, duel.getWinnerTeam());
    }

    @Test
    void resolveBall_threeConsecutiveMissesForfeitsOnlyAfkPlayer() {
        UUID a = UUID.randomUUID();
        UUID b = UUID.randomUUID();
        TwoPlayerDuel duel = TwoPlayerDuel.create(UUID.randomUUID(), a, b, 2);

        engine.resolveBall(duel, null, 1);
        engine.resolveBall(duel, null, 2);
        engine.resolveBall(duel, null, 3);

        assertEquals(DuelStatus.FORFEITED, duel.getStatus());
        assertEquals(TeamId.TEAM_B, duel.getWinnerTeam());
    }

    @Test
    void resolveBall_missStreakResetsAfterPick() {
        UUID a = UUID.randomUUID();
        UUID b = UUID.randomUUID();
        TwoPlayerDuel duel = TwoPlayerDuel.create(UUID.randomUUID(), a, b, 2);

        engine.resolveBall(duel, null, 1);
        engine.resolveBall(duel, null, 2);
        engine.resolveBall(duel, 4, 2);
        engine.resolveBall(duel, null, 1);

        assertEquals(DuelStatus.ACTIVE, duel.getStatus());
        assertEquals(1, duel.getConsecutiveMisses(a));
    }

    @Test
    void resolveBall_round1BothAfkIsDraw() {
        UUID a = UUID.randomUUID();
        UUID b = UUID.randomUUID();
        TwoPlayerDuel duel = TwoPlayerDuel.create(UUID.randomUUID(), a, b, 2);

        engine.resolveBall(duel, null, null);
        engine.resolveBall(duel, null, null);
        engine.resolveBall(duel, null, null);

        assertEquals(DuelStatus.DRAW, duel.getStatus());
        assertEquals(null, duel.getWinnerTeam());
    }

    @Test
    void resolveBall_round1OnlyBowlerAfkForfeits() {
        UUID a = UUID.randomUUID();
        UUID b = UUID.randomUUID();
        TwoPlayerDuel duel = TwoPlayerDuel.create(UUID.randomUUID(), a, b, 2);

        engine.resolveBall(duel, 1, null);
        engine.resolveBall(duel, 2, null);
        engine.resolveBall(duel, 3, null);

        assertEquals(DuelStatus.FORFEITED, duel.getStatus());
        assertEquals(TeamId.TEAM_A, duel.getWinnerTeam());
        assertEquals(1, duel.battingRound());
    }

    @Test
    void resolveBall_equalScoresWhenBothOutIsDraw() {
        UUID a = UUID.randomUUID();
        UUID b = UUID.randomUUID();
        TwoPlayerDuel duel = TwoPlayerDuel.create(UUID.randomUUID(), a, b, 1);

        engine.resolveBall(duel, 3, 3);
        engine.resolveBall(duel, 4, 4);

        assertEquals(DuelStatus.DRAW, duel.getStatus());
        assertEquals(null, duel.getWinnerTeam());
        assertEquals(0, duel.getScoreA());
        assertEquals(0, duel.getScoreB());
    }

    @Test
    void resolveBall_round2OnlyOneAfkForfeits() {
        UUID a = UUID.randomUUID();
        UUID b = UUID.randomUUID();
        TwoPlayerDuel duel = TwoPlayerDuel.create(UUID.randomUUID(), a, b, 2);

        engine.resolveBall(duel, 3, 3);
        assertEquals(2, duel.battingRound());

        engine.resolveBall(duel, null, 1);
        engine.resolveBall(duel, null, 2);
        engine.resolveBall(duel, null, 3);

        assertEquals(DuelStatus.FORFEITED, duel.getStatus());
        assertEquals(TeamId.TEAM_A, duel.getWinnerTeam());
    }
}

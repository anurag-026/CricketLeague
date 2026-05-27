package com.mol.anurag.mol_backend.game.event;

import com.mol.anurag.mol_backend.match.model.TeamId;

import java.util.UUID;

public record DuelEndedEvent(
        String eventType,
        UUID matchId,
        UUID duelId,
        TeamId winnerTeam,
        boolean forfeit,
        int duelScoreA,
        int duelScoreB,
        int teamAScore,
        int teamBScore) {

    public static DuelEndedEvent of(
            UUID matchId,
            UUID duelId,
            TeamId winnerTeam,
            boolean forfeit,
            int duelScoreA,
            int duelScoreB,
            int teamAScore,
            int teamBScore) {
        return new DuelEndedEvent(
                "DUEL_ENDED",
                matchId,
                duelId,
                winnerTeam,
                forfeit,
                duelScoreA,
                duelScoreB,
                teamAScore,
                teamBScore);
    }
}

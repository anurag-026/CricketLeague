package com.mol.anurag.mol_backend.game.event;

import java.util.UUID;

public record BallOpenEvent(
        String eventType,
        UUID matchId,
        UUID duelId,
        UUID batsmanId,
        UUID bowlerId,
        long deadlineEpochMs,
        int ballsRemaining) {

    public static BallOpenEvent of(
            UUID matchId,
            UUID duelId,
            UUID batsmanId,
            UUID bowlerId,
            long deadlineEpochMs,
            int ballsRemaining) {
        return new BallOpenEvent(
                "BALL_OPEN", matchId, duelId, batsmanId, bowlerId, deadlineEpochMs, ballsRemaining);
    }
}

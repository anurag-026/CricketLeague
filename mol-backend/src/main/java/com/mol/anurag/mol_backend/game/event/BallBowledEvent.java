package com.mol.anurag.mol_backend.game.event;

import com.mol.anurag.mol_backend.game.dto.MatchStateSnapshot;
import com.mol.anurag.mol_backend.game.model.BallOutcome;

public record BallBowledEvent(
        String eventType,
        int batsmanNumber,
        int bowlerNumber,
        BallOutcome outcome,
        int runsOnBall,
        MatchStateSnapshot matchState) {

    public static BallBowledEvent of(
            int batsmanNumber,
            int bowlerNumber,
            int runsOnBall,
            MatchStateSnapshot matchState) {
        return new BallBowledEvent(
                "BALL_BOWLED",
                batsmanNumber,
                bowlerNumber,
                BallOutcome.RUNS_SCORED,
                runsOnBall,
                matchState);
    }
}

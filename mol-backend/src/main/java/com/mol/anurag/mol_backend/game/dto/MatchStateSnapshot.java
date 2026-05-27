package com.mol.anurag.mol_backend.game.dto;

import java.util.List;

public record MatchStateSnapshot(
        int teamAScore,
        int teamAWickets,
        int teamBScore,
        int teamBWickets,
        int ballsRemainingInInnings,
        List<String> teamABallMarks,
        List<String> teamBBallMarks) {

    public static MatchStateSnapshot of(
            int teamAScore,
            int teamAWickets,
            int teamBScore,
            int teamBWickets,
            int ballsRemainingInInnings,
            List<String> teamABallMarks,
            List<String> teamBBallMarks) {
        return new MatchStateSnapshot(
                teamAScore,
                teamAWickets,
                teamBScore,
                teamBWickets,
                ballsRemainingInInnings,
                teamABallMarks,
                teamBBallMarks);
    }
}

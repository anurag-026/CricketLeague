package com.mol.anurag.mol_backend.game.event;

import com.mol.anurag.mol_backend.game.dto.MatchStateSnapshot;
import com.mol.anurag.mol_backend.game.model.BallOutcome;

import java.util.UUID;

public record WicketEvent(
        String eventType,
        int batsmanNumber,
        int bowlerNumber,
        BallOutcome outcome,
        UUID playerOut,
        UUID nextBatsman,
        MatchStateSnapshot matchState) {

    public static WicketEvent of(
            int batsmanNumber,
            int bowlerNumber,
            UUID playerOut,
            UUID nextBatsman,
            MatchStateSnapshot matchState) {
        return new WicketEvent(
                "WICKET",
                batsmanNumber,
                bowlerNumber,
                BallOutcome.WICKET,
                playerOut,
                nextBatsman,
                matchState);
    }
}

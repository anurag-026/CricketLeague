package com.mol.anurag.mol_backend.game.event;

import com.mol.anurag.mol_backend.game.dto.ScoreLine;
import com.mol.anurag.mol_backend.match.model.TeamId;

import java.util.Map;

public record MatchOverEvent(
        String eventType,
        TeamId winner,
        String winMargin,
        Map<TeamId, ScoreLine> finalScores) {

    public static MatchOverEvent of(TeamId winner, String winMargin, Map<TeamId, ScoreLine> finalScores) {
        return new MatchOverEvent("MATCH_OVER", winner, winMargin, finalScores);
    }
}

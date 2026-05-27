package com.mol.anurag.mol_backend.game.dto;

import com.mol.anurag.mol_backend.game.domain.MatchPhase;
import com.mol.anurag.mol_backend.match.model.TeamId;

import java.util.Map;
import java.util.UUID;

public record MatchLiveStateResponse(
        UUID matchId,
        MatchPhase phase,
        int innings,
        MatchConfigDto config,
        MatchStateSnapshot scoreboard,
        CurrentStateDto currentState,
        Map<TeamId, java.util.List<UUID>> teams,
        Map<String, String> playerUsernames,
        DuelStateDto myDuel,
        java.util.List<DuelStartDto> duels,
        TeamId winner,
        String winMargin) {}

package com.mol.anurag.mol_backend.game.event;

import com.mol.anurag.mol_backend.game.dto.CurrentStateDto;
import com.mol.anurag.mol_backend.game.dto.DuelStartDto;
import com.mol.anurag.mol_backend.game.dto.MatchConfigDto;
import com.mol.anurag.mol_backend.match.model.TeamId;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public record MatchStartEvent(
        String eventType,
        UUID matchId,
        MatchConfigDto config,
        Map<TeamId, List<UUID>> teams,
        List<DuelStartDto> duels,
        CurrentStateDto currentState,
        Map<String, String> playerUsernames) {

    public static MatchStartEvent of(
            UUID matchId,
            MatchConfigDto config,
            Map<TeamId, List<UUID>> teams,
            List<DuelStartDto> duels,
            CurrentStateDto currentState,
            Map<String, String> playerUsernames) {
        return new MatchStartEvent(
                "MATCH_START", matchId, config, teams, duels, currentState, playerUsernames);
    }
}

package com.mol.anurag.mol_backend.stats.dto;

import com.mol.anurag.mol_backend.match.model.TeamId;

import java.time.Instant;
import java.util.UUID;

public record MatchHistoryItemResponse(
        UUID matchId,
        String roomCode,
        String opponentUsername,
        TeamId playerTeam,
        TeamId winnerTeam,
        int teamAScore,
        int teamBScore,
        int runsScored,
        boolean won,
        String winMargin,
        Instant playedAt) {}

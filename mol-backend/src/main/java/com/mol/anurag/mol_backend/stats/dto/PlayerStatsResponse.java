package com.mol.anurag.mol_backend.stats.dto;

import java.util.UUID;

public record PlayerStatsResponse(
        UUID userId,
        int matchesPlayed,
        int wins,
        int losses,
        int currentWinStreak,
        int bestWinStreak,
        int totalRunsScored) {}

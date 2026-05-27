package com.mol.anurag.mol_backend.stats.dto;

import java.util.UUID;

public record PlayerProfileResponse(
        UUID userId,
        String username,
        String email,
        int matchesPlayed,
        int wins,
        int losses,
        int currentWinStreak,
        int bestWinStreak,
        int totalRunsScored) {}

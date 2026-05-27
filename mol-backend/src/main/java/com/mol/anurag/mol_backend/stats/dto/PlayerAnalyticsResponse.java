package com.mol.anurag.mol_backend.stats.dto;

import java.util.List;

public record PlayerAnalyticsResponse(
        PlayerStatsResponse stats, List<MatchHistoryItemResponse> recentMatches) {}

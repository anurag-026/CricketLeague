package com.mol.anurag.mol_backend.stats.controller;

import com.mol.anurag.mol_backend.stats.dto.MatchHistoryItemResponse;
import com.mol.anurag.mol_backend.stats.dto.PlayerAnalyticsResponse;
import com.mol.anurag.mol_backend.stats.dto.PlayerProfileResponse;
import com.mol.anurag.mol_backend.stats.dto.PlayerStatsResponse;
import com.mol.anurag.mol_backend.security.UserPrincipal;
import com.mol.anurag.mol_backend.stats.service.StatsService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/players")
public class StatsController {

    private final StatsService statsService;

    public StatsController(StatsService statsService) {
        this.statsService = statsService;
    }

    @GetMapping("/me/profile")
    public PlayerProfileResponse myProfile(@AuthenticationPrincipal UserPrincipal principal) {
        return statsService.getProfile(principal.userId());
    }

    @GetMapping("/me/stats")
    public PlayerStatsResponse myStats(@AuthenticationPrincipal UserPrincipal principal) {
        return statsService.getStats(principal.userId());
    }

    @GetMapping("/me/matches")
    public List<MatchHistoryItemResponse> myMatches(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "20") int limit) {
        return statsService.getMatchHistory(principal.userId(), limit);
    }

    @GetMapping("/me/analytics")
    public PlayerAnalyticsResponse myAnalytics(@AuthenticationPrincipal UserPrincipal principal) {
        return statsService.getAnalytics(principal.userId());
    }
}

package com.mol.anurag.mol_backend.stats.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "player_stats")
@Getter
@Setter
@NoArgsConstructor
public class PlayerStats {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @Column(nullable = false)
    private int matchesPlayed;

    @Column(nullable = false)
    private int wins;

    @Column(nullable = false)
    private int losses;

    @Column(name = "current_win_streak", nullable = false)
    private int currentWinStreak;

    @Column(name = "best_win_streak", nullable = false)
    private int bestWinStreak;

    @Column(name = "total_runs_scored", nullable = false)
    private int totalRunsScored;

    public PlayerStats(UUID userId) {
        this.userId = userId;
    }

    public void recordWin(int runsScored) {
        matchesPlayed++;
        wins++;
        currentWinStreak++;
        if (currentWinStreak > bestWinStreak) {
            bestWinStreak = currentWinStreak;
        }
        totalRunsScored += runsScored;
    }

    public void recordLoss(int runsScored) {
        matchesPlayed++;
        losses++;
        currentWinStreak = 0;
        totalRunsScored += runsScored;
    }

    public void recordDraw(int runsScored) {
        matchesPlayed++;
        currentWinStreak = 0;
        totalRunsScored += runsScored;
    }
}

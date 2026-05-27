package com.mol.anurag.mol_backend.stats.entity;

import com.mol.anurag.mol_backend.match.model.TeamId;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "match_history")
@Getter
@Setter
@NoArgsConstructor
public class MatchHistoryRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "match_id", nullable = false)
    private UUID matchId;

    @Column(name = "room_code", length = 16)
    private String roomCode;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "opponent_user_id")
    private UUID opponentUserId;

    @Enumerated(EnumType.STRING)
    @Column(name = "player_team", nullable = false, length = 16)
    private TeamId playerTeam;

    @Enumerated(EnumType.STRING)
    @Column(name = "winner_team", length = 16)
    private TeamId winnerTeam;

    @Column(name = "team_a_score", nullable = false)
    private int teamAScore;

    @Column(name = "team_b_score", nullable = false)
    private int teamBScore;

    @Column(name = "runs_scored", nullable = false)
    private int runsScored;

    @Column(name = "won", nullable = false)
    private boolean won;

    @Column(name = "win_margin", length = 128)
    private String winMargin;

    @Column(name = "played_at", nullable = false)
    private Instant playedAt = Instant.now();

    public MatchHistoryRecord(
            UUID matchId,
            String roomCode,
            UUID userId,
            UUID opponentUserId,
            TeamId playerTeam,
            TeamId winnerTeam,
            int teamAScore,
            int teamBScore,
            int runsScored,
            boolean won,
            String winMargin) {
        this.matchId = matchId;
        this.roomCode = roomCode;
        this.userId = userId;
        this.opponentUserId = opponentUserId;
        this.playerTeam = playerTeam;
        this.winnerTeam = winnerTeam;
        this.teamAScore = teamAScore;
        this.teamBScore = teamBScore;
        this.runsScored = runsScored;
        this.won = won;
        this.winMargin = winMargin;
    }
}

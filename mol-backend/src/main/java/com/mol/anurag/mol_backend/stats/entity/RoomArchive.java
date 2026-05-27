package com.mol.anurag.mol_backend.stats.entity;

import com.mol.anurag.mol_backend.match.model.RoomStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "room_archive")
@Getter
@Setter
@NoArgsConstructor
public class RoomArchive {

    @Id
    @Column(name = "room_code", length = 16)
    private String roomCode;

    @Column(name = "match_id", nullable = false)
    private UUID matchId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private RoomStatus status;

    @Column(name = "host_user_id", nullable = false)
    private UUID hostUserId;

    @Column(name = "team_size", nullable = false)
    private int teamSize;

    @Column(nullable = false)
    private int overs;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "completed_at")
    private Instant completedAt;

    public RoomArchive(
            String roomCode, UUID matchId, RoomStatus status, UUID hostUserId, int teamSize, int overs) {
        this.roomCode = roomCode.toUpperCase();
        this.matchId = matchId;
        this.status = status;
        this.hostUserId = hostUserId;
        this.teamSize = teamSize;
        this.overs = overs;
    }

    public boolean isJoinable() {
        return status == RoomStatus.WAITING_FOR_PLAYERS;
    }
}

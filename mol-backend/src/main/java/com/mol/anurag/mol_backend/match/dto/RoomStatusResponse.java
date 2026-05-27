package com.mol.anurag.mol_backend.match.dto;

import com.mol.anurag.mol_backend.match.model.RoomStatus;
import com.mol.anurag.mol_backend.match.model.TeamId;

import java.util.List;
import java.util.UUID;

public record RoomStatusResponse(
        String roomCode,
        UUID matchId,
        RoomStatus status,
        int teamSize,
        int overs,
        int playersJoined,
        int playersRequired,
        List<UUID> teamA,
        List<UUID> teamB,
        TeamId yourTeam) {}

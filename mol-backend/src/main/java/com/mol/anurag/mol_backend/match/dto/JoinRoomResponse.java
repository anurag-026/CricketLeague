package com.mol.anurag.mol_backend.match.dto;

import com.mol.anurag.mol_backend.match.model.TeamId;

import java.util.UUID;

public record JoinRoomResponse(UUID matchId, TeamId teamAssigned, boolean matchStarted) {}

package com.mol.anurag.mol_backend.match.dto;

import java.util.UUID;

public record CreateRoomResponse(String roomCode, UUID matchId, int expiresIn) {}

package com.mol.anurag.mol_backend.match.dto;

import java.util.UUID;

public record ActiveMatchResponse(UUID matchId, boolean inMatch) {}

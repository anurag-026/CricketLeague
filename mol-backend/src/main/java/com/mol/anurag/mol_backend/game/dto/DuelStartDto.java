package com.mol.anurag.mol_backend.game.dto;

import java.util.UUID;

public record DuelStartDto(UUID duelId, UUID playerA, UUID playerB) {}

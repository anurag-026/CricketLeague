package com.mol.anurag.mol_backend.game.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record GameActionRequest(
        @NotNull String actionType,
        @NotNull UUID playerId,
        @Min(1) @Max(6) Integer numberChosen) {}

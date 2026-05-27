package com.mol.anurag.mol_backend.match.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record CreateRoomRequest(
        @Min(1) @Max(6) int teamSize,
        @Min(1) @Max(20) int overs) {}

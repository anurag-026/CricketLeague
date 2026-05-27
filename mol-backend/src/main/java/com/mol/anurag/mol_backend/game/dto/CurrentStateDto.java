package com.mol.anurag.mol_backend.game.dto;

import com.mol.anurag.mol_backend.match.model.TeamId;

import java.util.UUID;

public record CurrentStateDto(TeamId battingTeam, UUID currentBatsman, UUID currentBowler) {}

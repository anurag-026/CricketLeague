package com.mol.anurag.mol_backend.game.domain;

import com.mol.anurag.mol_backend.match.model.TeamId;

import java.util.UUID;

public record BallResolution(
        BallResolutionType type,
        int batsmanNumber,
        int bowlerNumber,
        int runsOnBall,
        UUID playerOut,
        UUID nextBatsman,
        TeamId winner,
        String winMargin) {}

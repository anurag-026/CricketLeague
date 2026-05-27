package com.mol.anurag.mol_backend.game.dto;

import com.mol.anurag.mol_backend.game.domain.DuelStatus;

import java.util.List;
import java.util.UUID;

public record DuelStateDto(
        UUID duelId,
        UUID playerA,
        UUID playerB,
        int scoreA,
        int scoreB,
        UUID battingPlayerId,
        UUID bowlingPlayerId,
        boolean ballOpen,
        long ballDeadlineEpochMs,
        int ballsRemaining,
        Integer lastBatsmanPick,
        Integer lastBowlerPick,
        Integer lastRunsOnBall,
        boolean lastBallWicket,
        boolean lastBatsmanMissed,
        boolean lastBowlerMissed,
        DuelStatus status,
        boolean playerAOut,
        boolean playerBOut,
        List<String> teamABallMarks,
        List<String> teamBBallMarks) {}

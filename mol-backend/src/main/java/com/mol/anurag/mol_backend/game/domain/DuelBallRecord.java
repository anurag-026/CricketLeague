package com.mol.anurag.mol_backend.game.domain;

import java.util.UUID;

/** One resolved ball in a 1v1 duel. */
public class DuelBallRecord {

    private UUID batsmanId;
    private Integer batsmanPick;
    private Integer bowlerPick;
    private boolean batsmanMissed;
    private boolean bowlerMissed;
    private boolean wicket;
    private int runs;
    private int ballInOver;

    public DuelBallRecord() {}

    public static DuelBallRecord of(
            UUID batsmanId,
            Integer batsmanPick,
            Integer bowlerPick,
            boolean batsmanMissed,
            boolean bowlerMissed,
            boolean wicket,
            int runs,
            int ballInOver) {
        DuelBallRecord record = new DuelBallRecord();
        record.batsmanId = batsmanId;
        record.batsmanPick = batsmanPick;
        record.bowlerPick = bowlerPick;
        record.batsmanMissed = batsmanMissed;
        record.bowlerMissed = bowlerMissed;
        record.wicket = wicket;
        record.runs = runs;
        record.ballInOver = ballInOver;
        return record;
    }

    /** Single-player mark for the over strip under that player's team. */
    public String markForPlayer(UUID playerId) {
        boolean isBatsman = playerId.equals(batsmanId);
        if (wicket && isBatsman) {
            return "W";
        }
        if (isBatsman) {
            return formatPick(batsmanPick, batsmanMissed);
        }
        return formatPick(bowlerPick, bowlerMissed);
    }

    private static String formatPick(Integer pick, boolean missed) {
        if (missed) {
            return "M";
        }
        return String.valueOf(pick);
    }

    public UUID getBatsmanId() {
        return batsmanId;
    }

    public Integer getBatsmanPick() {
        return batsmanPick;
    }

    public Integer getBowlerPick() {
        return bowlerPick;
    }

    public boolean isBatsmanMissed() {
        return batsmanMissed;
    }

    public boolean isBowlerMissed() {
        return bowlerMissed;
    }

    public boolean isWicket() {
        return wicket;
    }

    public int getRuns() {
        return runs;
    }

    public int getBallInOver() {
        return ballInOver;
    }
}

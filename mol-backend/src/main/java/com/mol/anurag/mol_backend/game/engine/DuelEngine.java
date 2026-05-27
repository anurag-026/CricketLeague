package com.mol.anurag.mol_backend.game.engine;

import com.mol.anurag.mol_backend.game.domain.DuelBallRecord;
import com.mol.anurag.mol_backend.game.domain.DuelStatus;
import com.mol.anurag.mol_backend.game.domain.TwoPlayerDuel;
import com.mol.anurag.mol_backend.match.model.TeamId;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class DuelEngine {

    public static final int AFK_MISS_LIMIT = 3;

    public BallResolveResult resolveBall(TwoPlayerDuel duel, Integer batsmanPick, Integer bowlerPick) {
        boolean batsmanMissed = batsmanPick == null;
        boolean bowlerMissed = bowlerPick == null;

        int ballInOver = duel.ballInOverIndex();
        duel.decrementBall(); // record uses pre-decrement over index

        duel.setLastBatsmanPick(batsmanPick);
        duel.setLastBowlerPick(bowlerPick);
        duel.setLastBatsmanMissed(batsmanMissed);
        duel.setLastBowlerMissed(bowlerMissed);

        UUID batsmanId = duel.getBattingPlayerId();
        UUID bowlerId = duel.getBowlingPlayerId();
        boolean wicket = !batsmanMissed && !bowlerMissed && batsmanPick.equals(bowlerPick);
        int runs = 0;

        if (wicket) {
            duel.setLastBallWicket(true);
            duel.setLastRunsOnBall(0);
            duel.dismissBatsman(batsmanId);
            duel.swapRoles();
            if (duel.bothBattersOut() || duel.isPlayerOut(duel.getBattingPlayerId())) {
                finishDuelByScore(duel);
            }
        } else if (!batsmanMissed) {
            duel.setLastBallWicket(false);
            runs = batsmanPick;
            duel.addRunsToBatsman(runs);
            duel.setLastRunsOnBall(runs);
        } else {
            duel.setLastBallWicket(false);
            duel.setLastRunsOnBall(0);
        }

        duel.recordBall(DuelBallRecord.of(
                batsmanId,
                batsmanPick,
                bowlerPick,
                batsmanMissed,
                bowlerMissed,
                wicket,
                runs,
                ballInOver));

        duel.clearPending();
        duel.setBallOpen(false);

        if (!wicket && duel.getBallsRemaining() <= 0 && duel.getStatus() == DuelStatus.ACTIVE) {
            finishDuelByScore(duel);
        }

        tryCompleteOnTargetExceeded(duel);

        duel.updateMissStreak(batsmanId, batsmanMissed);
        duel.updateMissStreak(bowlerId, bowlerMissed);

        if (duel.getStatus() == DuelStatus.ACTIVE) {
            handleConsecutiveAfk(duel);
        }

        return new BallResolveResult(wicket, runs, batsmanPick, bowlerPick, batsmanMissed, bowlerMissed);
    }

    /**
     * Three consecutive missed picks (per player):
     * <ul>
     *   <li>Round 1 or 2 — only one player AFK: that player loses.</li>
     *   <li>Round 1 — both AFK: draw.</li>
     *   <li>Round 2 — both AFK: higher score wins; tied score is a draw.</li>
     * </ul>
     */
    private void handleConsecutiveAfk(TwoPlayerDuel duel) {
        boolean aAfk = duel.hasReachedAfkLimit(duel.getPlayerA(), AFK_MISS_LIMIT);
        boolean bAfk = duel.hasReachedAfkLimit(duel.getPlayerB(), AFK_MISS_LIMIT);
        if (!aAfk && !bAfk) {
            return;
        }

        if (aAfk && bAfk) {
            if (duel.battingRound() == 1) {
                endAsDraw(duel);
            } else if (duel.getScoreA() == duel.getScoreB()) {
                endAsDraw(duel);
            } else {
                finishDuelByScore(duel);
            }
            return;
        }

        forfeit(duel, aAfk ? duel.getPlayerA() : duel.getPlayerB());
    }

    private void endAsDraw(TwoPlayerDuel duel) {
        duel.setStatus(DuelStatus.DRAW);
        duel.setWinnerTeam(null);
        duel.setBallOpen(false);
        duel.clearPending();
    }

    /** When one batter is out, end as soon as the chaser's score exceeds the dismissed player's score. */
    private void tryCompleteOnTargetExceeded(TwoPlayerDuel duel) {
        if (duel.getStatus() != DuelStatus.ACTIVE) {
            return;
        }
        if (duel.isPlayerAOut() && !duel.isPlayerBOut()) {
            if (duel.getScoreB() > duel.getScoreA()) {
                duel.setStatus(DuelStatus.COMPLETED);
                duel.setWinnerTeam(TeamId.TEAM_B);
            }
        } else if (duel.isPlayerBOut() && !duel.isPlayerAOut()) {
            if (duel.getScoreA() > duel.getScoreB()) {
                duel.setStatus(DuelStatus.COMPLETED);
                duel.setWinnerTeam(TeamId.TEAM_A);
            }
        }
    }

    public void forfeit(TwoPlayerDuel duel, UUID loserId) {
        TeamId winner = duel.teamOf(duel.opponentOf(loserId));
        duel.setStatus(DuelStatus.FORFEITED);
        duel.setWinnerTeam(winner);
        duel.setBallOpen(false);
        duel.clearPending();
    }

    private void finishDuelByScore(TwoPlayerDuel duel) {
        if (duel.getScoreA() == duel.getScoreB()) {
            endAsDraw(duel);
            return;
        }
        duel.setStatus(DuelStatus.COMPLETED);
        duel.setWinnerTeam(
                duel.getScoreA() > duel.getScoreB() ? TeamId.TEAM_A : TeamId.TEAM_B);
        duel.setBallOpen(false);
        duel.clearPending();
    }

    public record BallResolveResult(
            boolean wicket,
            int runs,
            Integer batsmanPick,
            Integer bowlerPick,
            boolean batsmanMissed,
            boolean bowlerMissed) {}
}

package com.mol.anurag.mol_backend.stats.service;

import com.mol.anurag.mol_backend.game.domain.MatchSession;
import com.mol.anurag.mol_backend.game.domain.TwoPlayerDuel;
import com.mol.anurag.mol_backend.match.model.TeamId;
import com.mol.anurag.mol_backend.auth.entity.User;
import com.mol.anurag.mol_backend.auth.repository.UserRepository;
import com.mol.anurag.mol_backend.stats.dto.MatchHistoryItemResponse;
import com.mol.anurag.mol_backend.stats.dto.PlayerAnalyticsResponse;
import com.mol.anurag.mol_backend.stats.dto.PlayerProfileResponse;
import com.mol.anurag.mol_backend.stats.dto.PlayerStatsResponse;
import com.mol.anurag.mol_backend.stats.entity.MatchHistoryRecord;
import com.mol.anurag.mol_backend.stats.entity.PlayerStats;
import com.mol.anurag.mol_backend.stats.repository.MatchHistoryRepository;
import com.mol.anurag.mol_backend.stats.repository.PlayerStatsRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class StatsService {

    private final PlayerStatsRepository playerStatsRepository;
    private final MatchHistoryRepository matchHistoryRepository;
    private final UserRepository userRepository;

    public StatsService(
            PlayerStatsRepository playerStatsRepository,
            MatchHistoryRepository matchHistoryRepository,
            UserRepository userRepository) {
        this.playerStatsRepository = playerStatsRepository;
        this.matchHistoryRepository = matchHistoryRepository;
        this.userRepository = userRepository;
    }

    public PlayerProfileResponse getProfile(UUID userId) {
        User user = userRepository.findById(userId).orElseThrow();
        PlayerStats stats = playerStatsRepository
                .findById(userId)
                .orElseGet(() -> new PlayerStats(userId));
        return new PlayerProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                stats.getMatchesPlayed(),
                stats.getWins(),
                stats.getLosses(),
                stats.getCurrentWinStreak(),
                stats.getBestWinStreak(),
                stats.getTotalRunsScored());
    }

    public PlayerStatsResponse getStats(UUID userId) {
        PlayerStats stats = playerStatsRepository
                .findById(userId)
                .orElseGet(() -> new PlayerStats(userId));
        return toResponse(stats);
    }

    public List<MatchHistoryItemResponse> getMatchHistory(UUID userId, int limit) {
        return matchHistoryRepository
                .findByUserIdOrderByPlayedAtDesc(userId, PageRequest.of(0, Math.min(limit, 50)))
                .stream()
                .map(this::toHistoryItem)
                .toList();
    }

    public PlayerAnalyticsResponse getAnalytics(UUID userId) {
        PlayerStatsResponse stats = getStats(userId);
        List<MatchHistoryItemResponse> recent = getMatchHistory(userId, 10);
        return new PlayerAnalyticsResponse(stats, recent);
    }

    @Transactional
    public void recordMatchResult(
            MatchSession session,
            List<TwoPlayerDuel> duels,
            String roomCode,
            TeamId winnerTeam,
            String winMargin) {
        for (TwoPlayerDuel duel : duels) {
            recordPlayer(duel.getPlayerA(), duel, session, roomCode, winnerTeam, winMargin);
            recordPlayer(duel.getPlayerB(), duel, session, roomCode, winnerTeam, winMargin);
        }
    }

    private void recordPlayer(
            UUID userId,
            TwoPlayerDuel duel,
            MatchSession session,
            String roomCode,
            TeamId winnerTeam,
            String winMargin) {
        TeamId playerTeam = duel.teamOf(userId);
        boolean draw = winnerTeam == null;
        boolean won = !draw && playerTeam == winnerTeam;
        int runsScored = userId.equals(duel.getPlayerA()) ? duel.getScoreA() : duel.getScoreB();

        PlayerStats stats = playerStatsRepository.findById(userId).orElseGet(() -> new PlayerStats(userId));
        if (draw) {
            stats.recordDraw(runsScored);
        } else if (won) {
            stats.recordWin(runsScored);
        } else {
            stats.recordLoss(runsScored);
        }
        playerStatsRepository.save(stats);

        UUID opponentUserId = duel.opponentOf(userId);
        matchHistoryRepository.save(new MatchHistoryRecord(
                session.getMatchId(),
                roomCode,
                userId,
                opponentUserId,
                playerTeam,
                winnerTeam,
                session.getTeamAScore(),
                session.getTeamBScore(),
                runsScored,
                won,
                winMargin));
    }

    private PlayerStatsResponse toResponse(PlayerStats stats) {
        return new PlayerStatsResponse(
                stats.getUserId(),
                stats.getMatchesPlayed(),
                stats.getWins(),
                stats.getLosses(),
                stats.getCurrentWinStreak(),
                stats.getBestWinStreak(),
                stats.getTotalRunsScored());
    }

    private MatchHistoryItemResponse toHistoryItem(MatchHistoryRecord record) {
        String opponentUsername = "Opponent";
        if (record.getOpponentUserId() != null) {
            opponentUsername = userRepository
                    .findById(record.getOpponentUserId())
                    .map(User::getUsername)
                    .orElse("Opponent");
        }
        return new MatchHistoryItemResponse(
                record.getMatchId(),
                record.getRoomCode(),
                opponentUsername,
                record.getPlayerTeam(),
                record.getWinnerTeam(),
                record.getTeamAScore(),
                record.getTeamBScore(),
                record.getRunsScored(),
                record.isWon(),
                record.getWinMargin(),
                record.getPlayedAt());
    }
}

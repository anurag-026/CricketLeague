package com.mol.anurag.mol_backend.game.service;

import com.mol.anurag.mol_backend.game.domain.DuelStatus;
import com.mol.anurag.mol_backend.game.domain.MatchPhase;
import com.mol.anurag.mol_backend.game.domain.MatchSession;
import com.mol.anurag.mol_backend.game.domain.MatchSessionPhase;
import com.mol.anurag.mol_backend.game.domain.TwoPlayerDuel;
import com.mol.anurag.mol_backend.game.dto.CurrentStateDto;
import com.mol.anurag.mol_backend.game.dto.DuelStartDto;
import com.mol.anurag.mol_backend.game.dto.DuelStateDto;
import com.mol.anurag.mol_backend.game.dto.MatchConfigDto;
import com.mol.anurag.mol_backend.game.dto.MatchLiveStateResponse;
import com.mol.anurag.mol_backend.game.dto.MatchStateSnapshot;
import com.mol.anurag.mol_backend.game.dto.ScoreLine;
import com.mol.anurag.mol_backend.game.engine.DuelEngine;
import com.mol.anurag.mol_backend.game.event.BallOpenEvent;
import com.mol.anurag.mol_backend.game.event.BallResolvedEvent;
import com.mol.anurag.mol_backend.game.event.DuelEndedEvent;
import com.mol.anurag.mol_backend.game.event.MatchOverEvent;
import com.mol.anurag.mol_backend.game.event.MatchStartEvent;
import com.mol.anurag.mol_backend.game.redis.DuelRedisRepository;
import com.mol.anurag.mol_backend.game.redis.MatchHashRepository;
import com.mol.anurag.mol_backend.game.redis.RedisLockService;
import com.mol.anurag.mol_backend.game.redis.RoomRedisRepository;
import com.mol.anurag.mol_backend.match.model.RoomRecord;
import com.mol.anurag.mol_backend.stats.service.RoomArchiveService;
import com.mol.anurag.mol_backend.stats.service.StatsService;
import com.mol.anurag.mol_backend.auth.entity.User;
import com.mol.anurag.mol_backend.auth.repository.UserRepository;
import com.mol.anurag.mol_backend.match.model.RoomStatus;
import com.mol.anurag.mol_backend.match.model.TeamId;
import org.springframework.stereotype.Service;

import java.security.Principal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class GameService {

    public static final long BALL_WINDOW_MS = 6000;
    private static final int MIN_NUMBER = 1;
    private static final int MAX_NUMBER = 6;

    private final DuelRedisRepository duelRepository;
    private final MatchHashRepository matchRepository;
    private final RoomRedisRepository roomRepository;
    private final RedisLockService lockService;
    private final DuelEngine duelEngine;
    private final GameEventPublisher eventPublisher;
    private final BallTimerService ballTimer;
    private final StatsService statsService;
    private final RoomArchiveService roomArchiveService;
    private final UserRepository userRepository;

    public GameService(
            DuelRedisRepository duelRepository,
            MatchHashRepository matchRepository,
            RoomRedisRepository roomRepository,
            RedisLockService lockService,
            DuelEngine duelEngine,
            GameEventPublisher eventPublisher,
            BallTimerService ballTimer,
            StatsService statsService,
            RoomArchiveService roomArchiveService,
            UserRepository userRepository) {
        this.duelRepository = duelRepository;
        this.matchRepository = matchRepository;
        this.roomRepository = roomRepository;
        this.lockService = lockService;
        this.duelEngine = duelEngine;
        this.eventPublisher = eventPublisher;
        this.ballTimer = ballTimer;
        this.statsService = statsService;
        this.roomArchiveService = roomArchiveService;
        this.userRepository = userRepository;
    }

    public void startMatchFromRoom(RoomRecord room) {
        if (room.getStatus() == RoomStatus.STARTED) {
            return;
        }
        room.setStatus(RoomStatus.STARTED);

        UUID matchId = room.getMatchId();
        int teamSize = room.getTeamSize();
        int overs = room.getOvers();

        roomArchiveService.markStarted(room.getRoomCode());

        MatchSession session = MatchSession.create(matchId, room.getRoomCode(), teamSize, overs);
        List<UUID> teamA = List.copyOf(room.getTeamA());
        List<UUID> teamBShuffled = new ArrayList<>(room.getTeamB());
        Collections.shuffle(teamBShuffled);

        List<TwoPlayerDuel> duels = new ArrayList<>();
        for (int i = 0; i < teamSize; i++) {
            TwoPlayerDuel duel = TwoPlayerDuel.create(matchId, teamA.get(i), teamBShuffled.get(i), overs);
            duels.add(duel);
            session.addDuel(duel.getDuelId());
            duelRepository.saveDuel(duel);
        }
        duelRepository.saveSession(session);

        Map<TeamId, List<UUID>> teams = Map.of(TeamId.TEAM_A, teamA, TeamId.TEAM_B, List.copyOf(room.getTeamB()));
        teams.values().stream()
                .flatMap(List::stream)
                .forEach(playerId -> matchRepository.indexPlayerMatch(playerId, matchId));

        publishMatchStart(session, duels, teams, playerUsernames(duels));
        for (TwoPlayerDuel duel : duels) {
            openBall(duel);
        }
    }

    public Optional<MatchLiveStateResponse> getLiveState(UUID matchId, UUID requestingUserId) {
        MatchSession session = duelRepository.findSession(matchId).orElse(null);
        if (session == null) {
            return Optional.empty();
        }
        List<TwoPlayerDuel> duels = duelRepository.loadDuels(session);
        session.recalculateTeamScores(duels);
        boolean inMatch = duels.stream().anyMatch(d -> d.involves(requestingUserId));
        if (!inMatch) {
            return Optional.empty();
        }

        TwoPlayerDuel myDuel =
                duels.stream().filter(d -> d.involves(requestingUserId)).findFirst().orElse(null);

        MatchPhase phase =
                session.getPhase() == MatchSessionPhase.MATCH_OVER
                        ? MatchPhase.MATCH_OVER
                        : MatchPhase.IN_PROGRESS;

        return Optional.of(new MatchLiveStateResponse(
                matchId,
                phase,
                1,
                new MatchConfigDto(session.getTotalOvers(), session.getTeamSize()),
                teamSnapshot(session, myDuel),
                currentStateFromDuel(myDuel),
                Map.of(
                        TeamId.TEAM_A,
                        duels.stream().map(TwoPlayerDuel::getPlayerA).distinct().toList(),
                        TeamId.TEAM_B,
                        duels.stream().map(TwoPlayerDuel::getPlayerB).distinct().toList()),
                playerUsernames(duels),
                myDuel == null ? null : toDuelStateDto(myDuel),
                duels.stream()
                        .map(d -> new DuelStartDto(d.getDuelId(), d.getPlayerA(), d.getPlayerB()))
                        .toList(),
                session.getWinnerTeam(),
                session.getWinMargin()));
    }

    public void submitNumber(UUID matchId, UUID playerId, int number, Principal principal) {
        if (principal == null || !principal.getName().equals(playerId.toString())) {
            return;
        }
        if (number < MIN_NUMBER || number > MAX_NUMBER) {
            return;
        }

        try {
            lockService.executeWithMatchLock(matchId, () -> processSubmission(matchId, playerId, number));
        } catch (IllegalStateException ignored) {
            // concurrent submit
        }
    }

    public void leaveMatch(UUID matchId, UUID playerId) {
        forfeitMatch(matchId, playerId);
    }

    public void forfeitMatch(UUID matchId, UUID playerId) {
        try {
            lockService.executeWithMatchLock(matchId, () -> processForfeit(matchId, playerId));
        } catch (IllegalStateException ignored) {
            // lock contention
        }
    }

    private void processSubmission(UUID matchId, UUID playerId, int number) {
        MatchSession session = duelRepository.findSession(matchId).orElse(null);
        if (session == null || session.getPhase() == MatchSessionPhase.MATCH_OVER) {
            return;
        }

        TwoPlayerDuel duel = duelRepository.findDuelForPlayer(matchId, playerId).orElse(null);
        if (duel == null
                || duel.getStatus() != DuelStatus.ACTIVE
                || !duel.isBallOpen()) {
            return;
        }
        if (duel.isPlayerOut(playerId) && duel.isBatting(playerId)) {
            return;
        }

        if (duel.isBatting(playerId)) {
            if (duel.getPendingBatsmanPick() != null) {
                return;
            }
            duel.setPendingBatsmanPick(number);
        } else if (duel.isBowling(playerId)) {
            if (duel.getPendingBowlerPick() != null) {
                return;
            }
            duel.setPendingBowlerPick(number);
        } else {
            return;
        }

        duelRepository.saveDuel(duel);
    }

    private void processForfeit(UUID matchId, UUID playerId) {
        MatchSession session = duelRepository.findSession(matchId).orElse(null);
        if (session == null || session.getPhase() == MatchSessionPhase.MATCH_OVER) {
            return;
        }

        TwoPlayerDuel duel = duelRepository.findDuelForPlayer(matchId, playerId).orElse(null);
        if (duel == null || duel.getStatus() != DuelStatus.ACTIVE) {
            return;
        }

        ballTimer.cancel(duel.getDuelId());
        duelEngine.forfeit(duel, playerId);
        duelRepository.saveDuel(duel);

        if (session.getTeamSize() == 1) {
            session.setPhase(MatchSessionPhase.MATCH_OVER);
            TeamId winner = duel.getWinnerTeam();
            session.setWinnerTeam(winner);
            session.setWinMargin("Opponent forfeited (AFK or leave)");
            duelRepository.saveSession(session);
            publishDuelEnded(session, duel, true);
            List<TwoPlayerDuel> finishedDuels = duelRepository.loadDuels(session);
            publishMatchOver(session, finishedDuels);
            finalizeMatch(session, finishedDuels);
            clearPlayerIndexes(session, finishedDuels);
            return;
        }

        publishDuelEnded(session, duel, true);
        checkAllDuelsFinished(session);
    }

    private void onBallTimeout(UUID matchId, UUID duelId) {
        try {
            lockService.executeWithMatchLock(matchId, () -> {
                TwoPlayerDuel duel = duelRepository.findDuel(duelId).orElse(null);
                if (duel == null || !duel.isBallOpen() || duel.getStatus() != DuelStatus.ACTIVE) {
                    return;
                }
                resolveBall(duel, duel.getPendingBatsmanPick(), duel.getPendingBowlerPick());
            });
        } catch (IllegalStateException ignored) {
            // lock contention
        }
    }

    private void resolveBall(TwoPlayerDuel duel, Integer batsmanPick, Integer bowlerPick) {
        ballTimer.cancel(duel.getDuelId());
        DuelEngine.BallResolveResult result = duelEngine.resolveBall(duel, batsmanPick, bowlerPick);
        duelRepository.saveDuel(duel);

        MatchSession session =
                duelRepository.findSession(duel.getMatchId()).orElseThrow();
        session.recalculateTeamScores(duelRepository.loadDuels(session));
        duelRepository.saveSession(session);

        if (result.wicket()) {
            duel.clearAllOverMarks();
            duelRepository.saveDuel(duel);
        }

        publishBallResolved(session, duel, result);

        if (duel.getStatus() != DuelStatus.ACTIVE) {
            boolean forfeit = duel.getStatus() == DuelStatus.FORFEITED;
            publishDuelEnded(session, duel, forfeit);
            checkAllDuelsFinished(session);
        } else {
            openBall(duel);
        }
    }

    private void openBall(TwoPlayerDuel duel) {
        if (duel.getStatus() != DuelStatus.ACTIVE) {
            return;
        }
        if (duel.isPlayerOut(duel.getBattingPlayerId())) {
            return;
        }
        duel.clearPending();
        duel.setBallOpen(true);
        long deadline = System.currentTimeMillis() + BALL_WINDOW_MS;
        duel.setBallDeadlineEpochMs(deadline);
        duelRepository.saveDuel(duel);

        eventPublisher.publish(
                duel.getMatchId(),
                BallOpenEvent.of(
                        duel.getMatchId(),
                        duel.getDuelId(),
                        duel.getBattingPlayerId(),
                        duel.getBowlingPlayerId(),
                        deadline,
                        duel.getBallsRemaining()));

        ballTimer.schedule(
                duel.getDuelId(),
                () -> onBallTimeout(duel.getMatchId(), duel.getDuelId()),
                BALL_WINDOW_MS);
    }

    private void checkAllDuelsFinished(MatchSession session) {
        List<TwoPlayerDuel> duels = duelRepository.loadDuels(session);
        if (!session.allDuelsFinished(duels)) {
            session.recalculateTeamScores(duels);
            duelRepository.saveSession(session);
            return;
        }

        session.recalculateTeamScores(duels);
        TeamId winner = resolveMatchWinner(session, duels);
        session.setWinnerTeam(winner);
        session.setWinMargin(buildWinMargin(session, duels));
        session.setPhase(MatchSessionPhase.MATCH_OVER);
        duelRepository.saveSession(session);

        publishMatchOver(session, duels);
        finalizeMatch(session, duels);
        clearPlayerIndexes(session, duels);
    }

    private void finalizeMatch(MatchSession session, List<TwoPlayerDuel> duels) {
        String roomCode = session.getRoomCode();
        statsService.recordMatchResult(
                session, duels, roomCode, session.getWinnerTeam(), session.getWinMargin());
        roomArchiveService.markCompleted(roomCode);
        if (roomCode != null && !"QUEUE".equalsIgnoreCase(roomCode)) {
            roomRepository.delete(roomCode);
        }
    }

    private TeamId resolveMatchWinner(MatchSession session, List<TwoPlayerDuel> duels) {
        if (session.getTeamAScore() == session.getTeamBScore()) {
            return null;
        }
        boolean duelDrawn = duels.stream().anyMatch(d -> d.getStatus() == DuelStatus.DRAW);
        if (duelDrawn) {
            return null;
        }
        if (session.getTeamAScore() > session.getTeamBScore()) {
            return TeamId.TEAM_A;
        }
        return TeamId.TEAM_B;
    }

    private String buildWinMargin(MatchSession session, List<TwoPlayerDuel> duels) {
        if (session.getTeamAScore() == session.getTeamBScore()) {
            return "Draw — scores tied";
        }
        if (duels.stream().anyMatch(d -> d.getStatus() == DuelStatus.DRAW)) {
            return "Draw";
        }
        int diff = Math.abs(session.getTeamAScore() - session.getTeamBScore());
        return diff + " run(s)";
    }

    private Map<String, String> playerUsernames(List<TwoPlayerDuel> duels) {
        Map<String, String> names = new HashMap<>();
        for (TwoPlayerDuel duel : duels) {
            addUsername(names, duel.getPlayerA());
            addUsername(names, duel.getPlayerB());
        }
        return names;
    }

    private void addUsername(Map<String, String> names, UUID playerId) {
        if (names.containsKey(playerId.toString())) {
            return;
        }
        userRepository
                .findById(playerId)
                .map(User::getUsername)
                .ifPresent(username -> names.put(playerId.toString(), username));
    }

    private void publishMatchStart(
            MatchSession session,
            List<TwoPlayerDuel> duels,
            Map<TeamId, List<UUID>> teams,
            Map<String, String> playerUsernames) {
        TwoPlayerDuel first = duels.get(0);
        List<DuelStartDto> duelStarts = duels.stream()
                .map(d -> new DuelStartDto(d.getDuelId(), d.getPlayerA(), d.getPlayerB()))
                .toList();

        eventPublisher.publish(
                session.getMatchId(),
                MatchStartEvent.of(
                        session.getMatchId(),
                        new MatchConfigDto(session.getTotalOvers(), session.getTeamSize()),
                        teams,
                        duelStarts,
                        currentStateFromDuel(first),
                        playerUsernames));
    }

    private void publishBallResolved(
            MatchSession session, TwoPlayerDuel duel, DuelEngine.BallResolveResult result) {
        List<TwoPlayerDuel> duels = duelRepository.loadDuels(session);
        eventPublisher.publish(
                duel.getMatchId(),
                BallResolvedEvent.of(
                        duel.getMatchId(),
                        duel.getDuelId(),
                        result.batsmanPick(),
                        result.bowlerPick(),
                        result.wicket(),
                        result.batsmanMissed(),
                        result.bowlerMissed(),
                        result.runs(),
                        duel.getScoreA(),
                        duel.getScoreB(),
                        duel.getBattingPlayerId(),
                        duel.getBowlingPlayerId(),
                        duel.getBallsRemaining(),
                        duel.getScoreA(),
                        duel.getScoreB(),
                        session.countTeamWickets(duels, TeamId.TEAM_A),
                        session.countTeamWickets(duels, TeamId.TEAM_B),
                        TwoPlayerDuel.paddedOverMarks(duel.getTeamACurrentOverMarks()),
                        TwoPlayerDuel.paddedOverMarks(duel.getTeamBCurrentOverMarks()),
                        duel.getStatus().name(),
                        duel.isPlayerAOut(),
                        duel.isPlayerBOut()));
    }

    private void publishDuelEnded(MatchSession session, TwoPlayerDuel duel, boolean forfeit) {
        eventPublisher.publish(
                session.getMatchId(),
                DuelEndedEvent.of(
                        session.getMatchId(),
                        duel.getDuelId(),
                        duel.getWinnerTeam(),
                        forfeit,
                        duel.getScoreA(),
                        duel.getScoreB(),
                        session.getTeamAScore(),
                        session.getTeamBScore()));
    }

    private void publishMatchOver(MatchSession session, List<TwoPlayerDuel> duels) {
        Map<TeamId, ScoreLine> finalScores = new EnumMap<>(TeamId.class);
        finalScores.put(
                TeamId.TEAM_A, new ScoreLine(session.getTeamAScore(), countWickets(duels, TeamId.TEAM_A)));
        finalScores.put(
                TeamId.TEAM_B, new ScoreLine(session.getTeamBScore(), countWickets(duels, TeamId.TEAM_B)));

        eventPublisher.publish(
                session.getMatchId(),
                MatchOverEvent.of(session.getWinnerTeam(), session.getWinMargin(), finalScores));
    }

    private int countWickets(List<TwoPlayerDuel> duels, TeamId team) {
        int count = 0;
        for (TwoPlayerDuel duel : duels) {
            if (team == TeamId.TEAM_A && duel.isPlayerAOut()) {
                count++;
            } else if (team == TeamId.TEAM_B && duel.isPlayerBOut()) {
                count++;
            }
        }
        return count;
    }

    private void clearPlayerIndexes(MatchSession session, List<TwoPlayerDuel> duels) {
        duels.stream()
                .flatMap(d -> List.of(d.getPlayerA(), d.getPlayerB()).stream())
                .distinct()
                .forEach(matchRepository::clearPlayerMatchIndex);
    }

    private MatchStateSnapshot teamSnapshot(MatchSession session, TwoPlayerDuel myDuel) {
        List<TwoPlayerDuel> duels = duelRepository.loadDuels(session);
        int ballsRemaining = myDuel != null ? myDuel.getBallsRemaining() : 0;
        List<String> teamAMarks = myDuel != null
                ? TwoPlayerDuel.paddedOverMarks(myDuel.getTeamACurrentOverMarks())
                : List.of("", "", "", "", "", "");
        List<String> teamBMarks = myDuel != null
                ? TwoPlayerDuel.paddedOverMarks(myDuel.getTeamBCurrentOverMarks())
                : List.of("", "", "", "", "", "");
        int teamAScore = myDuel != null ? myDuel.getScoreA() : session.getTeamAScore();
        int teamBScore = myDuel != null ? myDuel.getScoreB() : session.getTeamBScore();
        return MatchStateSnapshot.of(
                teamAScore,
                session.countTeamWickets(duels, TeamId.TEAM_A),
                teamBScore,
                session.countTeamWickets(duels, TeamId.TEAM_B),
                ballsRemaining,
                teamAMarks,
                teamBMarks);
    }

    private CurrentStateDto currentStateFromDuel(TwoPlayerDuel duel) {
        if (duel == null) {
            return new CurrentStateDto(null, null, null);
        }
        TeamId battingTeam = duel.teamOf(duel.getBattingPlayerId());
        return new CurrentStateDto(
                battingTeam, duel.getBattingPlayerId(), duel.getBowlingPlayerId());
    }

    private DuelStateDto toDuelStateDto(TwoPlayerDuel duel) {
        return new DuelStateDto(
                duel.getDuelId(),
                duel.getPlayerA(),
                duel.getPlayerB(),
                duel.getScoreA(),
                duel.getScoreB(),
                duel.getBattingPlayerId(),
                duel.getBowlingPlayerId(),
                duel.isBallOpen(),
                duel.getBallDeadlineEpochMs(),
                duel.getBallsRemaining(),
                duel.getLastBatsmanPick(),
                duel.getLastBowlerPick(),
                duel.getLastRunsOnBall(),
                duel.isLastBallWicket(),
                duel.isLastBatsmanMissed(),
                duel.isLastBowlerMissed(),
                duel.getStatus(),
                duel.isPlayerAOut(),
                duel.isPlayerBOut(),
                TwoPlayerDuel.paddedOverMarks(duel.getTeamACurrentOverMarks()),
                TwoPlayerDuel.paddedOverMarks(duel.getTeamBCurrentOverMarks()));
    }
}

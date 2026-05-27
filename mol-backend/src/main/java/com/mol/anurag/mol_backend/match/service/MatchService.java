package com.mol.anurag.mol_backend.match.service;

import com.mol.anurag.mol_backend.common.ApiException;
import com.mol.anurag.mol_backend.config.MolProperties;
import com.mol.anurag.mol_backend.config.RedisJsonStore;
import com.mol.anurag.mol_backend.game.redis.MatchHashRepository;
import com.mol.anurag.mol_backend.game.redis.RedisKeys;
import com.mol.anurag.mol_backend.game.redis.RedisLockService;
import com.mol.anurag.mol_backend.game.redis.RoomRedisRepository;
import com.mol.anurag.mol_backend.game.service.GameService;
import com.mol.anurag.mol_backend.stats.service.RoomArchiveService;
import com.mol.anurag.mol_backend.match.dto.ActiveMatchResponse;
import com.mol.anurag.mol_backend.match.dto.CreateRoomRequest;
import com.mol.anurag.mol_backend.match.dto.CreateRoomResponse;
import com.mol.anurag.mol_backend.match.dto.JoinRoomResponse;
import com.mol.anurag.mol_backend.match.dto.QueueResponse;
import com.mol.anurag.mol_backend.match.dto.RoomStatusResponse;
import com.mol.anurag.mol_backend.match.model.RoomRecord;
import com.mol.anurag.mol_backend.match.model.RoomStatus;
import com.mol.anurag.mol_backend.match.model.TeamId;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class MatchService {

    private static final String QUEUE_STATUS = "IN_QUEUE";
    private static final String CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    private final RoomRedisRepository roomRepository;
    private final MatchHashRepository matchRepository;
    private final GameService gameService;
    private final RedisJsonStore redis;
    private final RedisLockService lockService;
    private final MolProperties properties;
    private final RoomArchiveService roomArchiveService;
    private final SecureRandom random = new SecureRandom();

    public MatchService(
            RoomRedisRepository roomRepository,
            MatchHashRepository matchRepository,
            GameService gameService,
            RedisJsonStore redis,
            RedisLockService lockService,
            MolProperties properties,
            RoomArchiveService roomArchiveService) {
        this.roomRepository = roomRepository;
        this.matchRepository = matchRepository;
        this.gameService = gameService;
        this.redis = redis;
        this.lockService = lockService;
        this.properties = properties;
        this.roomArchiveService = roomArchiveService;
    }

    public CreateRoomResponse createRoom(UUID hostUserId, CreateRoomRequest request) {
        String roomCode = generateUniqueRoomCode();
        UUID matchId = UUID.randomUUID();
        RoomRecord room = new RoomRecord(roomCode, matchId, request.teamSize(), request.overs(), hostUserId);
        roomRepository.save(room, Duration.ofSeconds(properties.room().ttlSeconds()));
        roomArchiveService.registerRoom(room);
        return new CreateRoomResponse(roomCode, matchId, properties.room().ttlSeconds());
    }

    public JoinRoomResponse joinRoom(UUID userId, String roomCode) {
        return lockService.executeWithRoomLock(roomCode, () -> joinRoomUnderLock(userId, roomCode));
    }

    public RoomStatusResponse getRoomStatus(UUID userId, String roomCode) {
        RoomRecord room = roomRepository
                .findByCode(roomCode)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Room not found or expired"));

        TeamId yourTeam = null;
        if (room.hasPlayer(userId)) {
            yourTeam = teamForPlayer(room, userId);
        }

        int playersJoined = room.getTeamA().size() + room.getTeamB().size();
        int playersRequired = room.getTeamSize() * 2;

        return new RoomStatusResponse(
                room.getRoomCode(),
                room.getMatchId(),
                room.getStatus(),
                room.getTeamSize(),
                room.getOvers(),
                playersJoined,
                playersRequired,
                List.copyOf(room.getTeamA()),
                List.copyOf(room.getTeamB()),
                yourTeam);
    }

    public ActiveMatchResponse getActiveMatch(UUID userId) {
        return matchRepository
                .findMatchIdForPlayer(userId)
                .map(id -> new ActiveMatchResponse(id, true))
                .orElse(new ActiveMatchResponse(null, false));
    }

    public QueueResponse joinQueue(UUID userId) {
        String payload = userId + ":" + System.currentTimeMillis();
        redis.template().opsForList().rightPush(RedisKeys.MATCH_QUEUE, payload);
        tryMatchFromQueue();
        return new QueueResponse(QUEUE_STATUS, properties.matchmaking().estimatedWaitSeconds());
    }

    public void leaveQueue(UUID userId) {
        String prefix = userId.toString() + ":";
        List<String> entries = redis.template().opsForList().range(RedisKeys.MATCH_QUEUE, 0, -1);
        if (entries == null || entries.isEmpty()) {
            return;
        }
        redis.delete(RedisKeys.MATCH_QUEUE);
        entries.stream()
                .filter(entry -> !entry.startsWith(prefix))
                .forEach(entry -> redis.template().opsForList().rightPush(RedisKeys.MATCH_QUEUE, entry));
    }

    private JoinRoomResponse joinRoomUnderLock(UUID userId, String roomCode) {
        roomArchiveService.assertJoinable(roomCode);
        RoomRecord room = roomRepository
                .findByCode(roomCode)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Room full or expired"));

        if (room.getStatus() == RoomStatus.STARTED) {
            if (room.hasPlayer(userId)) {
                return new JoinRoomResponse(room.getMatchId(), teamForPlayer(room, userId), true);
            }
            throw new ApiException(HttpStatus.BAD_REQUEST, "Room full or expired");
        }

        if (room.hasPlayer(userId)) {
            return new JoinRoomResponse(
                    room.getMatchId(), teamForPlayer(room, userId), room.getStatus() == RoomStatus.STARTED);
        }
        if (room.isFull()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Room full or expired");
        }

        TeamId assigned = assignTeam(room, userId);
        roomRepository.save(room, Duration.ofSeconds(properties.room().ttlSeconds()));

        boolean matchStarted = room.isFull();
        if (matchStarted) {
            gameService.startMatchFromRoom(room);
        }

        return new JoinRoomResponse(room.getMatchId(), assigned, matchStarted);
    }

    private void tryMatchFromQueue() {
        int teamSize = properties.matchmaking().queueTeamSize();
        int playersNeeded = teamSize * 2;
        List<String> entries = new ArrayList<>();
        for (int i = 0; i < playersNeeded; i++) {
            String entry = redis.template().opsForList().leftPop(RedisKeys.MATCH_QUEUE);
            if (entry == null) {
                entries.forEach(e -> redis.template().opsForList().leftPush(RedisKeys.MATCH_QUEUE, e));
                return;
            }
            entries.add(entry);
        }

        List<UUID> playerIds = entries.stream()
                .map(e -> UUID.fromString(e.split(":")[0]))
                .toList();

        int overs = properties.matchmaking().queueOvers();
        UUID matchId = UUID.randomUUID();
        RoomRecord room = new RoomRecord("QUEUE", matchId, teamSize, overs, playerIds.get(0));

        List<UUID> teamA = new ArrayList<>();
        List<UUID> teamB = new ArrayList<>();
        for (int i = 0; i < playerIds.size(); i++) {
            if (i < teamSize) {
                teamA.add(playerIds.get(i));
            } else {
                teamB.add(playerIds.get(i));
            }
        }
        room.setTeamA(teamA);
        room.setTeamB(teamB);
        roomRepository.save(room, Duration.ofHours(2));
        gameService.startMatchFromRoom(room);
    }

    private TeamId assignTeam(RoomRecord room, UUID userId) {
        if (room.getTeamA().size() < room.getTeamSize()) {
            room.getTeamA().add(userId);
            return TeamId.TEAM_A;
        }
        room.getTeamB().add(userId);
        return TeamId.TEAM_B;
    }

    private TeamId teamForPlayer(RoomRecord room, UUID userId) {
        return room.getTeamA().contains(userId) ? TeamId.TEAM_A : TeamId.TEAM_B;
    }

    private String generateUniqueRoomCode() {
        int length = properties.room().codeLength();
        for (int attempt = 0; attempt < 20; attempt++) {
            String code = randomCode(length);
            if (roomRepository.findByCode(code).isEmpty()) {
                return code;
            }
        }
        throw new IllegalStateException("Unable to generate unique room code");
    }

    private String randomCode(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(CODE_ALPHABET.charAt(random.nextInt(CODE_ALPHABET.length())));
        }
        return sb.toString();
    }
}

package com.mol.anurag.mol_backend.game.redis;

import com.mol.anurag.mol_backend.game.domain.GameState;
import com.mol.anurag.mol_backend.game.domain.MatchPhase;
import com.mol.anurag.mol_backend.match.model.TeamId;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Repository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
public class MatchHashRepository {

    private static final String FIELD_PHASE = "phase";
    private static final String FIELD_INNINGS = "innings";
    private static final String FIELD_BATTING_TEAM = "battingTeam";
    private static final String FIELD_TEAM_A_SCORE = "teamAScore";
    private static final String FIELD_TEAM_A_WICKETS = "teamAWickets";
    private static final String FIELD_TEAM_B_SCORE = "teamBScore";
    private static final String FIELD_TEAM_B_WICKETS = "teamBWickets";
    private static final String FIELD_BALLS_REMAINING = "ballsRemaining";
    private static final String FIELD_TOTAL_OVERS = "totalOvers";
    private static final String FIELD_TEAM_SIZE = "teamSize";
    private static final String FIELD_CURRENT_BATSMAN = "currentBatsmanId";
    private static final String FIELD_CURRENT_BOWLER = "currentBowlerId";
    private static final String FIELD_PENDING_BATSMAN = "pendingBatsmanInput";
    private static final String FIELD_PENDING_BOWLER = "pendingBowlerInput";
    private static final String FIELD_FIRST_INNINGS_TARGET = "firstInningsTarget";
    private static final String FIELD_TEAM_A = "teamA";
    private static final String FIELD_TEAM_B = "teamB";
    private static final String FIELD_BOWLER_INDEX = "currentBowlerIndex";

    private final StringRedisTemplate redis;

    public MatchHashRepository(StringRedisTemplate redis) {
        this.redis = redis;
    }

    public void save(GameState state) {
        String key = RedisKeys.match(state.getMatchId());
        redis.opsForHash().putAll(key, toHash(state));
    }

    public void savePendingInputs(UUID matchId, Integer batsmanInput, Integer bowlerInput) {
        String key = RedisKeys.match(matchId);
        if (batsmanInput != null) {
            redis.opsForHash().put(key, FIELD_PENDING_BATSMAN, batsmanInput.toString());
        }
        if (bowlerInput != null) {
            redis.opsForHash().put(key, FIELD_PENDING_BOWLER, bowlerInput.toString());
        }
    }

    public Optional<GameState> findById(UUID matchId) {
        Map<Object, Object> entries = redis.opsForHash().entries(RedisKeys.match(matchId));
        if (entries.isEmpty()) {
            return Optional.empty();
        }
        return Optional.of(fromHash(matchId, entries));
    }

    public void indexPlayerMatch(UUID playerId, UUID matchId) {
        redis.opsForValue().set(RedisKeys.userMatch(playerId), matchId.toString());
    }

    public Optional<UUID> findMatchIdForPlayer(UUID playerId) {
        String value = redis.opsForValue().get(RedisKeys.userMatch(playerId));
        if (value == null || value.isBlank()) {
            return Optional.empty();
        }
        return Optional.of(UUID.fromString(value));
    }

    public void clearPlayerMatchIndex(UUID playerId) {
        redis.delete(RedisKeys.userMatch(playerId));
    }

    private Map<String, String> toHash(GameState state) {
        Map<String, String> hash = new HashMap<>();
        hash.put(FIELD_PHASE, state.getPhase().name());
        hash.put(FIELD_INNINGS, Integer.toString(state.getInnings()));
        hash.put(FIELD_BATTING_TEAM, state.getBattingTeam().name());
        hash.put(FIELD_TEAM_A_SCORE, Integer.toString(state.getTeamAScore()));
        hash.put(FIELD_TEAM_A_WICKETS, Integer.toString(state.getTeamAWickets()));
        hash.put(FIELD_TEAM_B_SCORE, Integer.toString(state.getTeamBScore()));
        hash.put(FIELD_TEAM_B_WICKETS, Integer.toString(state.getTeamBWickets()));
        hash.put(FIELD_BALLS_REMAINING, Integer.toString(state.getBallsRemaining()));
        hash.put(FIELD_TOTAL_OVERS, Integer.toString(state.getTotalOvers()));
        hash.put(FIELD_TEAM_SIZE, Integer.toString(state.getTeamSize()));
        hash.put(FIELD_CURRENT_BATSMAN, uuidToString(state.getCurrentBatsmanId()));
        hash.put(FIELD_CURRENT_BOWLER, uuidToString(state.getCurrentBowlerId()));
        hash.put(FIELD_PENDING_BATSMAN, integerToString(state.getPendingBatsmanInput()));
        hash.put(FIELD_PENDING_BOWLER, integerToString(state.getPendingBowlerInput()));
        hash.put(FIELD_FIRST_INNINGS_TARGET, integerToString(state.getFirstInningsTarget()));
        hash.put(FIELD_TEAM_A, joinUuids(state.getTeams().get(TeamId.TEAM_A)));
        hash.put(FIELD_TEAM_B, joinUuids(state.getTeams().get(TeamId.TEAM_B)));
        hash.put(FIELD_BOWLER_INDEX, Integer.toString(state.getCurrentBowlerIndex()));
        return hash;
    }

    private GameState fromHash(UUID matchId, Map<Object, Object> entries) {
        Map<String, String> hash = entries.entrySet().stream()
                .collect(Collectors.toMap(e -> e.getKey().toString(), e -> e.getValue().toString()));

        GameState state = new GameState();
        state.setMatchId(matchId);
        state.setPhase(MatchPhase.valueOf(hash.get(FIELD_PHASE)));
        state.setInnings(Integer.parseInt(hash.get(FIELD_INNINGS)));
        state.setBattingTeam(TeamId.valueOf(hash.get(FIELD_BATTING_TEAM)));
        state.setTeamAScore(Integer.parseInt(hash.get(FIELD_TEAM_A_SCORE)));
        state.setTeamAWickets(Integer.parseInt(hash.get(FIELD_TEAM_A_WICKETS)));
        state.setTeamBScore(Integer.parseInt(hash.get(FIELD_TEAM_B_SCORE)));
        state.setTeamBWickets(Integer.parseInt(hash.get(FIELD_TEAM_B_WICKETS)));
        state.setBallsRemaining(Integer.parseInt(hash.get(FIELD_BALLS_REMAINING)));
        state.setTotalOvers(Integer.parseInt(hash.get(FIELD_TOTAL_OVERS)));
        state.setTeamSize(Integer.parseInt(hash.get(FIELD_TEAM_SIZE)));
        state.setCurrentBatsmanId(parseUuid(hash.get(FIELD_CURRENT_BATSMAN)));
        state.setCurrentBowlerId(parseUuid(hash.get(FIELD_CURRENT_BOWLER)));
        state.setPendingBatsmanInput(parseInteger(hash.get(FIELD_PENDING_BATSMAN)));
        state.setPendingBowlerInput(parseInteger(hash.get(FIELD_PENDING_BOWLER)));
        state.setFirstInningsTarget(parseInteger(hash.get(FIELD_FIRST_INNINGS_TARGET)));
        state.setCurrentBowlerIndex(Integer.parseInt(hash.getOrDefault(FIELD_BOWLER_INDEX, "0")));

        Map<TeamId, List<UUID>> teams = new HashMap<>();
        teams.put(TeamId.TEAM_A, splitUuids(hash.get(FIELD_TEAM_A)));
        teams.put(TeamId.TEAM_B, splitUuids(hash.get(FIELD_TEAM_B)));
        state.setTeams(teams);
        return state;
    }

    private static String joinUuids(List<UUID> ids) {
        return ids.stream().map(UUID::toString).collect(Collectors.joining(","));
    }

    private static List<UUID> splitUuids(String value) {
        if (value == null || value.isBlank()) {
            return List.of();
        }
        return java.util.Arrays.stream(value.split(",")).map(UUID::fromString).toList();
    }

    private static String uuidToString(UUID id) {
        return id == null ? "" : id.toString();
    }

    private static UUID parseUuid(String value) {
        return value == null || value.isBlank() ? null : UUID.fromString(value);
    }

    private static String integerToString(Integer value) {
        return value == null ? "" : value.toString();
    }

    private static Integer parseInteger(String value) {
        return value == null || value.isBlank() ? null : Integer.parseInt(value);
    }
}

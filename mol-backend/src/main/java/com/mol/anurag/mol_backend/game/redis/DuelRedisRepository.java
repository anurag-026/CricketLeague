package com.mol.anurag.mol_backend.game.redis;

import com.mol.anurag.mol_backend.config.RedisJsonStore;
import com.mol.anurag.mol_backend.game.domain.MatchSession;
import com.mol.anurag.mol_backend.game.domain.TwoPlayerDuel;
import org.springframework.stereotype.Repository;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class DuelRedisRepository {

    private static final Duration TTL = Duration.ofHours(4);

    private final RedisJsonStore redis;

    public DuelRedisRepository(RedisJsonStore redis) {
        this.redis = redis;
    }

    public void saveSession(MatchSession session) {
        redis.save(RedisKeys.matchSession(session.getMatchId()), session, TTL);
    }

    public Optional<MatchSession> findSession(UUID matchId) {
        return redis.get(RedisKeys.matchSession(matchId), MatchSession.class);
    }

    public void saveDuel(TwoPlayerDuel duel) {
        redis.save(RedisKeys.duel(duel.getDuelId()), duel, TTL);
    }

    public Optional<TwoPlayerDuel> findDuel(UUID duelId) {
        return redis.get(RedisKeys.duel(duelId), TwoPlayerDuel.class);
    }

    public List<TwoPlayerDuel> loadDuels(MatchSession session) {
        List<TwoPlayerDuel> duels = new ArrayList<>();
        for (UUID duelId : session.getDuelIds()) {
            findDuel(duelId).ifPresent(duels::add);
        }
        return duels;
    }

    public Optional<TwoPlayerDuel> findDuelForPlayer(UUID matchId, UUID playerId) {
        return findSession(matchId)
                .flatMap(session -> loadDuels(session).stream()
                        .filter(d -> d.involves(playerId))
                        .findFirst());
    }
}

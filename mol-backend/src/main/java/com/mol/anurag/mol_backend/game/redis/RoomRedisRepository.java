package com.mol.anurag.mol_backend.game.redis;

import com.mol.anurag.mol_backend.config.RedisJsonStore;
import com.mol.anurag.mol_backend.match.model.RoomRecord;
import org.springframework.stereotype.Repository;

import java.time.Duration;
import java.util.Optional;

@Repository
public class RoomRedisRepository {

    private final RedisJsonStore redis;

    public RoomRedisRepository(RedisJsonStore redis) {
        this.redis = redis;
    }

    public void save(RoomRecord room, Duration ttl) {
        redis.save(RedisKeys.room(room.getRoomCode()), room, ttl);
    }

    public Optional<RoomRecord> findByCode(String roomCode) {
        return redis.get(RedisKeys.room(roomCode), RoomRecord.class);
    }

    public void delete(String roomCode) {
        redis.delete(RedisKeys.room(roomCode));
    }
}

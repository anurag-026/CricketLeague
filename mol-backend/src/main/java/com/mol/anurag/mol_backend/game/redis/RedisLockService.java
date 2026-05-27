package com.mol.anurag.mol_backend.game.redis;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Collections;
import java.util.UUID;
import java.util.function.Supplier;

@Component
public class RedisLockService {

    private static final Duration LOCK_TTL = Duration.ofSeconds(5);

    private static final DefaultRedisScript<Long> UNLOCK_SCRIPT = new DefaultRedisScript<>(
            """
            if redis.call('get', KEYS[1]) == ARGV[1] then
              return redis.call('del', KEYS[1])
            else
              return 0
            end
            """,
            Long.class);

    private final StringRedisTemplate redis;

    public RedisLockService(StringRedisTemplate redis) {
        this.redis = redis;
    }

    public <T> T executeWithMatchLock(UUID matchId, Supplier<T> action) {
        return executeWithLock(RedisKeys.matchLock(matchId), action);
    }

    public void executeWithMatchLock(UUID matchId, Runnable action) {
        executeWithLock(RedisKeys.matchLock(matchId), () -> {
            action.run();
            return null;
        });
    }

    public <T> T executeWithRoomLock(String roomCode, Supplier<T> action) {
        return executeWithLock(RedisKeys.roomLock(roomCode), action);
    }

    private <T> T executeWithLock(String lockKey, Supplier<T> action) {
        String token = UUID.randomUUID().toString();
        boolean acquired = Boolean.TRUE.equals(
                redis.opsForValue().setIfAbsent(lockKey, token, LOCK_TTL));
        if (!acquired) {
            throw new IllegalStateException("Could not acquire lock: " + lockKey);
        }
        try {
            return action.get();
        } finally {
            redis.execute(UNLOCK_SCRIPT, Collections.singletonList(lockKey), token);
        }
    }
}

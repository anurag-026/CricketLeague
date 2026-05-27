package com.mol.anurag.mol_backend.config;

import org.springframework.data.redis.core.StringRedisTemplate;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

import java.time.Duration;
import java.util.Optional;

public class RedisJsonStore {

    private final StringRedisTemplate redis;
    private final ObjectMapper objectMapper;

    public RedisJsonStore(StringRedisTemplate redis, ObjectMapper objectMapper) {
        this.redis = redis;
        this.objectMapper = objectMapper;
    }

    public <T> void save(String key, T value, Duration ttl) {
        try {
            String json = objectMapper.writeValueAsString(value);
            if (ttl != null) {
                redis.opsForValue().set(key, json, ttl);
            } else {
                redis.opsForValue().set(key, json);
            }
        } catch (JacksonException e) {
            throw new IllegalStateException("Failed to serialize value for key " + key, e);
        }
    }

    public <T> Optional<T> get(String key, Class<T> type) {
        String json = redis.opsForValue().get(key);
        if (json == null) {
            return Optional.empty();
        }
        try {
            return Optional.of(objectMapper.readValue(json, type));
        } catch (JacksonException e) {
            throw new IllegalStateException("Failed to deserialize value for key " + key, e);
        }
    }

    public void delete(String key) {
        redis.delete(key);
    }

    public StringRedisTemplate template() {
        return redis;
    }
}

package com.mol.anurag.mol_backend.game.redis;

import java.util.UUID;

public final class RedisKeys {

    private RedisKeys() {}

    public static final String MATCH_QUEUE = "matchmaking:queue";

    public static String room(String roomCode) {
        return "room:" + roomCode.toUpperCase();
    }

    public static String match(UUID matchId) {
        return "match:" + matchId;
    }

    public static String matchLock(UUID matchId) {
        return "lock:match:" + matchId;
    }

    public static String roomLock(String roomCode) {
        return "lock:room:" + roomCode.toUpperCase();
    }

    public static String userMatch(UUID userId) {
        return "user:" + userId + ":match";
    }

    public static String matchSession(UUID matchId) {
        return "session:" + matchId;
    }

    public static String duel(UUID duelId) {
        return "duel:" + duelId;
    }
}

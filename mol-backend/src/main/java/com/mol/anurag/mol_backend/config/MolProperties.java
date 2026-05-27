package com.mol.anurag.mol_backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "mol")
public record MolProperties(Jwt jwt, Room room, Matchmaking matchmaking) {

    public record Jwt(String secret, long expirationMs) {}

    public record Room(int codeLength, int ttlSeconds) {}

    public record Matchmaking(int estimatedWaitSeconds, int queueTeamSize, int queueOvers) {}
}

package com.mol.anurag.mol_backend.auth.dto;

import java.util.UUID;

public record AuthTokenResponse(String token, UUID userId) {}

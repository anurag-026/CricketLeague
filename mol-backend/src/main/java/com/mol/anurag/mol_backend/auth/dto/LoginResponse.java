package com.mol.anurag.mol_backend.auth.dto;

import java.util.UUID;

public record LoginResponse(String token, UUID userId, String username) {}

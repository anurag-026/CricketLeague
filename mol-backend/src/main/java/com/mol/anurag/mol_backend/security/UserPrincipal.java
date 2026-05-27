package com.mol.anurag.mol_backend.security;

import java.security.Principal;
import java.util.UUID;

public record UserPrincipal(UUID userId, String username) implements Principal {

    @Override
    public String getName() {
        return userId.toString();
    }
}

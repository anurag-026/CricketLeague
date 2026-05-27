package com.mol.anurag.mol_backend.auth.controller;

import com.mol.anurag.mol_backend.auth.dto.AuthTokenResponse;
import com.mol.anurag.mol_backend.auth.dto.LoginRequest;
import com.mol.anurag.mol_backend.auth.dto.LoginResponse;
import com.mol.anurag.mol_backend.auth.dto.RegisterRequest;
import com.mol.anurag.mol_backend.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthTokenResponse> register(@Valid @RequestBody RegisterRequest request) {
        LoginResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new AuthTokenResponse(response.token(), response.userId()));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}

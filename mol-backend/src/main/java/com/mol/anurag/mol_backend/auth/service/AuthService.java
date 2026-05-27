package com.mol.anurag.mol_backend.auth.service;

import com.mol.anurag.mol_backend.auth.dto.LoginRequest;
import com.mol.anurag.mol_backend.auth.dto.LoginResponse;
import com.mol.anurag.mol_backend.auth.dto.RegisterRequest;
import com.mol.anurag.mol_backend.auth.entity.User;
import com.mol.anurag.mol_backend.auth.repository.UserRepository;
import com.mol.anurag.mol_backend.common.ApiException;
import com.mol.anurag.mol_backend.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public LoginResponse register(RegisterRequest request) {
        if (userRepository.existsByUsernameIgnoreCase(request.username())) {
            throw new ApiException(HttpStatus.CONFLICT, "Username already taken");
        }
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new ApiException(HttpStatus.CONFLICT, "Email already registered");
        }

        User user = new User(
                request.username().trim(),
                request.email().trim().toLowerCase(),
                passwordEncoder.encode(request.password()));
        userRepository.save(user);

        String token = jwtService.generateToken(user.getId(), user.getUsername());
        return new LoginResponse(token, user.getId(), user.getUsername());
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository
                .findByEmailIgnoreCase(request.email().trim())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid credentials");
        }

        String token = jwtService.generateToken(user.getId(), user.getUsername());
        return new LoginResponse(token, user.getId(), user.getUsername());
    }
}

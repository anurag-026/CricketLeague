package com.mol.anurag.mol_backend.security;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
public class StompAuthChannelInterceptor implements ChannelInterceptor {

    private static final String AUTHORIZATION = "Authorization";

    private final JwtService jwtService;

    public StompAuthChannelInterceptor(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null) {
            return message;
        }

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String authHeader = firstNativeHeader(accessor, AUTHORIZATION);
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                throw new AccessDeniedException("Missing or invalid Authorization header on STOMP CONNECT");
            }
            String token = authHeader.substring(7);
            if (!jwtService.isValid(token)) {
                throw new AccessDeniedException("Invalid or expired JWT on STOMP CONNECT");
            }
            UUID userId = jwtService.extractUserId(token);
            String username = jwtService.extractUsername(token);
            accessor.setUser(new UserPrincipal(userId, username));
        }

        return message;
    }

    private static String firstNativeHeader(StompHeaderAccessor accessor, String name) {
        List<String> values = accessor.getNativeHeader(name);
        if (values == null || values.isEmpty()) {
            return null;
        }
        return values.get(0);
    }
}

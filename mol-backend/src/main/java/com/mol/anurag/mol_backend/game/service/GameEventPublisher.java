package com.mol.anurag.mol_backend.game.service;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class GameEventPublisher {

    private final SimpMessagingTemplate messagingTemplate;

    public GameEventPublisher(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void publish(UUID matchId, Object event) {
        messagingTemplate.convertAndSend("/topic/match/" + matchId, event);
    }
}

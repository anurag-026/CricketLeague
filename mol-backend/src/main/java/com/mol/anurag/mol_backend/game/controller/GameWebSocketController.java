package com.mol.anurag.mol_backend.game.controller;

import com.mol.anurag.mol_backend.game.dto.GameActionRequest;
import com.mol.anurag.mol_backend.game.service.GameService;
import com.mol.anurag.mol_backend.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.UUID;

@Controller
public class GameWebSocketController {

    private static final String SUBMIT_NUMBER = "SUBMIT_NUMBER";

    private final GameService gameService;

    public GameWebSocketController(GameService gameService) {
        this.gameService = gameService;
    }

    @MessageMapping("/match/{matchId}/action")
    public void handleAction(
            @DestinationVariable String matchId,
            @Valid @Payload GameActionRequest request,
            Principal principal) {

        if (!SUBMIT_NUMBER.equals(request.actionType()) || request.numberChosen() == null) {
            return;
        }

        UUID matchUuid = UUID.fromString(matchId);
        gameService.submitNumber(matchUuid, request.playerId(), request.numberChosen(), principal);
    }
}

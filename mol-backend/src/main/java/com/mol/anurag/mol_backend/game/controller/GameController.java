package com.mol.anurag.mol_backend.game.controller;

import com.mol.anurag.mol_backend.common.ApiException;
import com.mol.anurag.mol_backend.game.dto.MatchLiveStateResponse;
import com.mol.anurag.mol_backend.game.service.GameService;
import com.mol.anurag.mol_backend.security.UserPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/match")
public class GameController {

    private final GameService gameService;

    public GameController(GameService gameService) {
        this.gameService = gameService;
    }

    @GetMapping("/{matchId}/state")
    public ResponseEntity<MatchLiveStateResponse> getMatchState(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID matchId) {
        return gameService
                .getLiveState(matchId, principal.userId())
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Match not found"));
    }

    @PostMapping("/{matchId}/leave")
    public ResponseEntity<Void> leaveMatch(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID matchId) {
        gameService.leaveMatch(matchId, principal.userId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{matchId}/forfeit")
    public ResponseEntity<Void> forfeitMatch(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID matchId) {
        gameService.forfeitMatch(matchId, principal.userId());
        return ResponseEntity.noContent().build();
    }
}

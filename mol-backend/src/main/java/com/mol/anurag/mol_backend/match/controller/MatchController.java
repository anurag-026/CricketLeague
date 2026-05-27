package com.mol.anurag.mol_backend.match.controller;

import com.mol.anurag.mol_backend.match.dto.ActiveMatchResponse;
import com.mol.anurag.mol_backend.match.dto.CreateRoomRequest;
import com.mol.anurag.mol_backend.match.dto.CreateRoomResponse;
import com.mol.anurag.mol_backend.match.dto.JoinRoomResponse;
import com.mol.anurag.mol_backend.match.dto.QueueResponse;
import com.mol.anurag.mol_backend.match.dto.RoomStatusResponse;
import com.mol.anurag.mol_backend.match.service.MatchService;
import com.mol.anurag.mol_backend.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/match")
public class MatchController {

    private final MatchService matchService;

    public MatchController(MatchService matchService) {
        this.matchService = matchService;
    }

    @PostMapping("/room")
    public ResponseEntity<CreateRoomResponse> createRoom(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateRoomRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(matchService.createRoom(principal.userId(), request));
    }

    @GetMapping("/room/{roomCode}")
    public ResponseEntity<RoomStatusResponse> getRoomStatus(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable String roomCode) {
        return ResponseEntity.ok(matchService.getRoomStatus(principal.userId(), roomCode.toUpperCase()));
    }

    @PostMapping("/room/{roomCode}/join")
    public ResponseEntity<JoinRoomResponse> joinRoom(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String roomCode,
            @RequestBody(required = false) Map<String, Object> body) {
        return ResponseEntity.ok(matchService.joinRoom(principal.userId(), roomCode.toUpperCase()));
    }

    @PostMapping("/queue")
    public ResponseEntity<QueueResponse> joinQueue(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(matchService.joinQueue(principal.userId()));
    }

    @DeleteMapping("/queue")
    public ResponseEntity<Void> leaveQueue(@AuthenticationPrincipal UserPrincipal principal) {
        matchService.leaveQueue(principal.userId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me/active")
    public ResponseEntity<ActiveMatchResponse> getActiveMatch(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(matchService.getActiveMatch(principal.userId()));
    }
}

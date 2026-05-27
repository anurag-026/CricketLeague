package com.mol.anurag.mol_backend.stats.service;

import com.mol.anurag.mol_backend.common.ApiException;
import com.mol.anurag.mol_backend.match.model.RoomRecord;
import com.mol.anurag.mol_backend.match.model.RoomStatus;
import com.mol.anurag.mol_backend.stats.entity.RoomArchive;
import com.mol.anurag.mol_backend.stats.repository.RoomArchiveRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
public class RoomArchiveService {

    private final RoomArchiveRepository roomArchiveRepository;

    public RoomArchiveService(RoomArchiveRepository roomArchiveRepository) {
        this.roomArchiveRepository = roomArchiveRepository;
    }

    @Transactional
    public void registerRoom(RoomRecord room) {
        if ("QUEUE".equalsIgnoreCase(room.getRoomCode())) {
            return;
        }
        String code = room.getRoomCode().toUpperCase();
        if (roomArchiveRepository.existsById(code)) {
            return;
        }
        roomArchiveRepository.save(new RoomArchive(
                code,
                room.getMatchId(),
                RoomStatus.WAITING_FOR_PLAYERS,
                room.getHostUserId(),
                room.getTeamSize(),
                room.getOvers()));
    }

    @Transactional
    public void markStarted(String roomCode) {
        if (roomCode == null || "QUEUE".equalsIgnoreCase(roomCode)) {
            return;
        }
        roomArchiveRepository.findById(roomCode.toUpperCase()).ifPresent(archive -> {
            archive.setStatus(RoomStatus.STARTED);
            roomArchiveRepository.save(archive);
        });
    }

    @Transactional
    public void markCompleted(String roomCode) {
        if (roomCode == null || "QUEUE".equalsIgnoreCase(roomCode)) {
            return;
        }
        roomArchiveRepository.findById(roomCode.toUpperCase()).ifPresent(archive -> {
            archive.setStatus(RoomStatus.COMPLETED);
            archive.setCompletedAt(Instant.now());
            roomArchiveRepository.save(archive);
        });
    }

    public void assertJoinable(String roomCode) {
        if (roomCode == null || "QUEUE".equalsIgnoreCase(roomCode)) {
            return;
        }
        roomArchiveRepository.findById(roomCode.toUpperCase()).ifPresent(archive -> {
            if (!archive.isJoinable()) {
                throw new ApiException(
                        HttpStatus.BAD_REQUEST, "Room code has expired or the match has already finished");
            }
        });
    }
}

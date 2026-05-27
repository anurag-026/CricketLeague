package com.mol.anurag.mol_backend.match.model;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class RoomRecord {

    private String roomCode;
    private UUID matchId;
    private RoomStatus status = RoomStatus.WAITING_FOR_PLAYERS;
    private int teamSize;
    private int overs;
    private UUID hostUserId;
    private List<UUID> teamA = new ArrayList<>();
    private List<UUID> teamB = new ArrayList<>();

    public RoomRecord() {}

    public RoomRecord(String roomCode, UUID matchId, int teamSize, int overs, UUID hostUserId) {
        this.roomCode = roomCode;
        this.matchId = matchId;
        this.teamSize = teamSize;
        this.overs = overs;
        this.hostUserId = hostUserId;
        this.teamA.add(hostUserId);
    }

    public boolean isFull() {
        return teamA.size() + teamB.size() >= teamSize * 2;
    }

    public boolean hasPlayer(UUID userId) {
        return teamA.contains(userId) || teamB.contains(userId);
    }

    public String getRoomCode() {
        return roomCode;
    }

    public void setRoomCode(String roomCode) {
        this.roomCode = roomCode;
    }

    public UUID getMatchId() {
        return matchId;
    }

    public void setMatchId(UUID matchId) {
        this.matchId = matchId;
    }

    public RoomStatus getStatus() {
        return status;
    }

    public void setStatus(RoomStatus status) {
        this.status = status;
    }

    public int getTeamSize() {
        return teamSize;
    }

    public void setTeamSize(int teamSize) {
        this.teamSize = teamSize;
    }

    public int getOvers() {
        return overs;
    }

    public void setOvers(int overs) {
        this.overs = overs;
    }

    public UUID getHostUserId() {
        return hostUserId;
    }

    public void setHostUserId(UUID hostUserId) {
        this.hostUserId = hostUserId;
    }

    public List<UUID> getTeamA() {
        return teamA;
    }

    public void setTeamA(List<UUID> teamA) {
        this.teamA = teamA;
    }

    public List<UUID> getTeamB() {
        return teamB;
    }

    public void setTeamB(List<UUID> teamB) {
        this.teamB = teamB;
    }
}

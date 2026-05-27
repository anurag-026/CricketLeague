package com.mol.anurag.mol_backend.game.domain;

public class InvalidMoveException extends RuntimeException {

    public InvalidMoveException(String message) {
        super(message);
    }
}

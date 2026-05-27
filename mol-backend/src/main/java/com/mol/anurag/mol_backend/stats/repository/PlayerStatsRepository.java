package com.mol.anurag.mol_backend.stats.repository;

import com.mol.anurag.mol_backend.stats.entity.PlayerStats;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PlayerStatsRepository extends JpaRepository<PlayerStats, UUID> {}

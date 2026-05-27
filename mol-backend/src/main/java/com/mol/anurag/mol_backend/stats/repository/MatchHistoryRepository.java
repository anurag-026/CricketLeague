package com.mol.anurag.mol_backend.stats.repository;

import com.mol.anurag.mol_backend.stats.entity.MatchHistoryRecord;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MatchHistoryRepository extends JpaRepository<MatchHistoryRecord, UUID> {

    List<MatchHistoryRecord> findByUserIdOrderByPlayedAtDesc(UUID userId, Pageable pageable);
}

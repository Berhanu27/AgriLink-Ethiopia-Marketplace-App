package com.agrilink.cooperative.repository;

import com.agrilink.cooperative.model.CooperativeMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CooperativeMemberRepository extends JpaRepository<CooperativeMember, Long> {
    List<CooperativeMember> findByCooperativeIdOrderByCreatedAtDesc(Long cooperativeId);

    Optional<CooperativeMember> findByIdAndCooperativeId(Long id, Long cooperativeId);
}

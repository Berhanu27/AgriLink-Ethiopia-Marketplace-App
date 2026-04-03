package com.agrilink.listing.repository;

import com.agrilink.listing.model.Match;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MatchRepository extends JpaRepository<Match, Long> {
}

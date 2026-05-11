package com.agrilink.user.repository;

import com.agrilink.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByPhone(String phone);
    long countByVerificationStatus(String verificationStatus);
    
    @Query("SELECT COUNT(u) FROM User u JOIN u.roles r WHERE r.userName = :roleName")
    long countByRoleName(@Param("roleName") String roleName);
    
    @Query("SELECT u.region, COUNT(u) FROM User u WHERE u.region IS NOT NULL AND u.region != '' GROUP BY u.region")
    List<Object[]> countUsersByRegion();
}

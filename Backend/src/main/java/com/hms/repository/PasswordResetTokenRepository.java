package com.hms.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.hms.entity.PasswordResetToken;
import com.hms.entity.User;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByOtpAndEmail(String otp, String email);

    Optional<PasswordResetToken> findByEmailAndIsUsedFalseAndIsVerifiedTrue(String email);

    Optional<PasswordResetToken> findByUserAndIsUsedFalseAndIsVerifiedFalse(User user);
    
    @Query("SELECT p FROM PasswordResetToken p WHERE p.email = ?1 AND p.isUsed = false ORDER BY p.createdAt DESC LIMIT 1")
    Optional<PasswordResetToken> findLatestUnusedTokenByEmail(String email);
}

package com.hms.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hms.entity.SignupMagicLinkToken;

public interface SignupMagicLinkTokenRepository extends JpaRepository<SignupMagicLinkToken, Long> {

    Optional<SignupMagicLinkToken> findByToken(String token);

    Optional<SignupMagicLinkToken> findByTokenAndEmail(String token, String email);

    Optional<SignupMagicLinkToken> findByEmailAndIsUsedFalse(String email);

    Optional<SignupMagicLinkToken> findTopByEmailAndIsUsedFalseOrderByCreatedAtDesc(String email);
}

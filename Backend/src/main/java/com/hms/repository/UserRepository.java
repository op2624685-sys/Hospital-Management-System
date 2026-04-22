package com.hms.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hms.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);
    Optional<User> findByUsernameIgnoreCase(String username);

    Optional<User> findByEmailIgnoreCase(String email);

    List<User> findTop5ByUsernameStartingWithIgnoreCase(String username);
}

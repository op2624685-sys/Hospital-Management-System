package com.hms.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hms.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);
    Optional<User> findByUsernameIgnoreCase(String username);

    java.util.List<User> findTop10ByUsernameStartingWithIgnoreCase(String username);
}

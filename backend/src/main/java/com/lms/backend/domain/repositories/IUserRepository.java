package com.lms.backend.domain.repositories;

import com.lms.backend.domain.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IUserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
   
    List<User> findByRole(String role);

    long countByRole(String string);

    
}
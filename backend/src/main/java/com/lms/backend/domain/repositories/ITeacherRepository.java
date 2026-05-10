package com.lms.backend.domain.repositories;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import com.lms.backend.domain.entities.Teacher;

public interface ITeacherRepository extends JpaRepository<Teacher, UUID> {
    
    // CHANGE THIS: Add 'User' before 'Email' so JPA knows to check the linked User entity
    Optional<Teacher> findByUserEmail(String email);

    // This is also needed for your AuthService
    Optional<Teacher> findByUserId(UUID userId);
}
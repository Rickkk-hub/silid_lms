package com.lms.backend.domain.repositories;

import com.lms.backend.domain.entities.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;
import java.util.Optional;

@Repository
public interface IStudentRepository extends JpaRepository<Student, UUID> {
    // Crucial for the Student Login logic
    Optional<Student> findByUserId(UUID userId);
    
    // Used to verify unique student numbers
    Optional<Student> findByStudentNumber(String studentNumber);
}
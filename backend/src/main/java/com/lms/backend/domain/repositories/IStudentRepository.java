package com.lms.backend.domain.repositories;

import com.lms.backend.domain.entities.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface IStudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByUserUserid(long userId);
}
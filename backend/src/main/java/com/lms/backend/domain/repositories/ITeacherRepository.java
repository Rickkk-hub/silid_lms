package com.lms.backend.domain.repositories;

import com.lms.backend.domain.entities.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ITeacherRepository extends JpaRepository<Teacher, Long> {
    Optional<Teacher> findByUserUserid(long userId);
}
package com.lms.backend.domain.repositories;

import com.lms.backend.domain.entities.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ICourseRepository extends JpaRepository<Course, Long> {
    boolean existsByCode(String code);
}
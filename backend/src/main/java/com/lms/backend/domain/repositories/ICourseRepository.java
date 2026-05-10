package com.lms.backend.domain.repositories;

import com.lms.backend.domain.entities.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface ICourseRepository extends JpaRepository<Course, UUID> {
    
    Optional<Course> findByCode(String code);

    boolean existsByCode(String code);

    /** * FIX: Gagamit tayo ng Query para sigurado. 
     * Kung ang variable sa Course.java ay hindi 'teacher', 
     * palitan mo yung 'c.teacher' sa baba ng tamang variable name (e.g., c.instructor).
     */
    @Query("SELECT COUNT(c) FROM Course c WHERE c.teacher IS NULL")
    long countByTeacherIsNull();

    @Query("SELECT COUNT(DISTINCT c.department) FROM Course c")
    long countDistinctDepartments();
}
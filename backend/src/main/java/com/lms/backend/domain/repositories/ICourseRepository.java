package com.lms.backend.domain.repositories;

import com.lms.backend.domain.entities.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ICourseRepository extends JpaRepository<Course, Long> {
    boolean existsByCode(String code);
    long countByTeacherIsNull();
    Optional<Course> findByCode(String code);
    
    // Custom query para sa Admin Registry View
    @Query("SELECT c FROM Course c LEFT JOIN FETCH c.teacher t LEFT JOIN FETCH t.user")
    List<Course> findAllWithTeacher();
}
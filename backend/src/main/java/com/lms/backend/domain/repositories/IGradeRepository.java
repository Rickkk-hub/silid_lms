package com.lms.backend.domain.repositories;

import com.lms.backend.domain.entities.Grade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface IGradeRepository extends JpaRepository<Grade, Long> {
    
    // For Teachers: See all grades they've issued for a section
  Optional<Grade> findByStudentIdAndTeacherIdAndSection(Long studentId, Long teacherId, String section);

    // For Students: See their own grades
    List<Grade> findByStudentId(Long studentId);
    
    List<Grade> findByTeacherIdAndSection(Long teacherid, String section);
}
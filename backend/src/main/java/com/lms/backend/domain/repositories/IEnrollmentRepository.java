package com.lms.backend.domain.repositories;

import com.lms.backend.domain.entities.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface IEnrollmentRepository extends JpaRepository<Enrollment, Long> {
    
    // For Admin: View everyone in a specific year/term
    List<Enrollment> findBySchoolYearAndSemester(String schoolYear, String semester);

    // For Teacher: View their instructional load
    List<Enrollment> findByTeacherId(Long teacherId);

    // For Student: View their enrolled subjects
    List<Enrollment> findByStudentId(Long studentId);

    // For Class Records: Fetch everyone in a specific section string
    List<Enrollment> findBySection(String section);

    // FIX: The missing method needed by EnrollmentService.java
    Optional<Enrollment> findByStudentIdAndCourseIdAndSection(Long studentId, Long courseId, String section);
}
package com.lms.backend.domain.repositories;

import com.lms.backend.domain.entities.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface IAttendanceRepository extends JpaRepository<Attendance, Long> {
    // Basic filters
    List<Attendance> findBySectionAndDate(String section, LocalDate date);
    List<Attendance> findByStudentId(Long studentId);
    
    // Aligns with the "Recent Logs" card (Top 5)
    List<Attendance> findTop5ByTeacherIdOrderByDateDesc(Long teacherId);
    
    // Aligns with the "Audit Logs" table (History)
    List<Attendance> findByTeacherIdOrderByDateDesc(Long teacherId);

    Optional<Attendance> findByStudentIdAndCourseIdAndDate(Long studentId, Long courseId, LocalDate date);
}
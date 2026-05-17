package com.lms.backend.domain.repositories;

import com.lms.backend.domain.entities.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface IAttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findBySectionAndDate(String section, LocalDate date);
    
    // Bridge lookup matching student by User ID
    List<Attendance> findByStudent_User_UserId(Long userId);
    
    // Top records limit lookup for logs dashboard
    List<Attendance> findTop5ByTeacher_User_UserIdOrderByDateDesc(Long userId);
    
    // Audit log dataset query ordered by timeline tracking
    List<Attendance> findByTeacher_User_UserIdOrderByDateDesc(Long userId);

    // --- FIXED PROPERTY REFERENCE BRIDGE ---
    // Gagamit ng Student_Id at Course_Id para saktong tumama sa core entity mapping configuration ng domain tables mo
    Optional<Attendance> findByStudent_IdAndCourse_IdAndDate(Long studentId, Long courseId, LocalDate date);
}
package com.lms.backend.domain.repositories;

import com.lms.backend.domain.entities.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface IAttendanceRepository extends JpaRepository<Attendance, UUID> {

    List<Attendance> findByStudentIdOrderByAttendanceDateDesc(UUID studentId);

    // FIX: Using underscores helps JPA navigate nested relationships clearly
    List<Attendance> findBySection_Teacher_IdOrderByAttendanceDateDesc(UUID teacherId);

    // FIX: Use AttendanceDate instead of CreatedAt if CreatedAt isn't defined in your entity
    List<Attendance> findTop10BySection_Teacher_IdOrderByAttendanceDateDesc(UUID teacherId);

    boolean existsByStudentIdAndSectionIdAndAttendanceDate(
            UUID studentId,
            UUID sectionId,
            LocalDate date
    );
}
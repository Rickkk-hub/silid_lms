package com.lms.backend.domain.repositories;

import com.lms.backend.domain.entities.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.UUID;
import java.util.List;

public interface IEnrollmentRepository extends JpaRepository<Enrollment, UUID> {
    
    List<Enrollment> findByStudentId(UUID studentId);

    @Query("SELECT e FROM Enrollment e " +
           "JOIN FETCH e.student s " +
           "JOIN FETCH s.user u " +
           "WHERE e.section.id = :sectionId")
    List<Enrollment> findBySection_Id(UUID sectionId);

    // ADD THIS: Finds enrollments by the User ID linked to the Student
    @Query("SELECT e FROM Enrollment e " +
           "JOIN FETCH e.section sec " +
           "JOIN FETCH e.student s " +
           "WHERE s.user.id = :userId")
    List<Enrollment> findByStudentUserId(@Param("userId") UUID userId);

    boolean existsByStudentIdAndSectionId(UUID studentId, UUID sectionId);
}
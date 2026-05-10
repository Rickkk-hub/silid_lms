package com.lms.backend.domain.repositories;

import com.lms.backend.domain.entities.Grade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface IGradeRepository extends JpaRepository<Grade, UUID> {

    @Query("SELECT g FROM Grade g " +
           "JOIN FETCH g.enrollment e " +
           "JOIN FETCH e.student s " +
           "JOIN FETCH s.user u " + 
           "LEFT JOIN FETCH g.task t " + 
           "WHERE e.section.id = :sectionId")
    List<Grade> findBySectionWithStudentAndTask(@Param("sectionId") UUID sectionId);

    // Optimized for the Student Summary page
    @Query("SELECT g FROM Grade g " +
           "JOIN FETCH g.task t " +
           "JOIN FETCH g.enrollment e " +
           "JOIN FETCH e.section sec " +
           "JOIN FETCH sec.course c " +
           "WHERE e.student.user.id = :userId")
    List<Grade> findByStudentUserId(@Param("userId") UUID userId);

    @Query("SELECT g FROM Grade g " +
           "JOIN FETCH g.task t " +
           "WHERE g.enrollment.id = :enrollmentId")
    List<Grade> findByEnrollmentId(@Param("enrollmentId") UUID enrollmentId);

    // Important for avoiding duplicate grades for the same task
    Optional<Grade> findByEnrollmentIdAndTaskId(UUID enrollmentId, UUID taskId);

    List<Grade> findByTaskId(UUID taskId);
}
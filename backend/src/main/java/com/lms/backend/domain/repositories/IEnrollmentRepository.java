package com.lms.backend.domain.repositories;

import com.lms.backend.domain.entities.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Repository
public interface IEnrollmentRepository extends JpaRepository<Enrollment, Long> {

    @Query("SELECT e FROM Enrollment e WHERE e.student.user.userId = :userId " +
           "AND e.course.id = :courseId AND e.status IN ('PENDING', 'ACTIVE')")
    Optional<Enrollment> findExistingApplication(@Param("userId") Long userId, @Param("courseId") Long courseId);

    @Query("SELECT e FROM Enrollment e WHERE e.status = 'OPEN' AND e.id NOT IN " +
           "(SELECT en.id FROM Enrollment en WHERE en.student.user.userId = :userId)")
    List<Enrollment> findAvailableOffersForStudent(@Param("userId") Long userId);

    @Query("SELECT e FROM Enrollment e WHERE e.student.user.userId = :userId")
    List<Enrollment> findByStudent_User_UserId(@Param("userId") Long userId);

    @Query("SELECT e FROM Enrollment e WHERE e.teacher.user.userId = :userId")
    List<Enrollment> findByTeacher_User_UserId(@Param("userId") Long userId);
  
    @Query("SELECT e FROM Enrollment e WHERE e.status = 'OPEN' AND e.student IS NULL")
    List<Enrollment> findByStatusAndStudentIsNull(String status);

    List<Enrollment> findByStudent_User_UserIdAndStatus(Long userId, String status);

    List<Enrollment> findBySection(String section);
    
    List<Enrollment> findByStudentIsNull();

    // --- RESTFUL VALIDATION PURGE FOR DELETING ENROLLED STUDENTS ---
    @Modifying
    @Transactional
    @Query("DELETE FROM Enrollment e WHERE e.student.id = :studentId")
    void deleteByStudentId(@Param("studentId") Long studentId);
}
package com.lms.backend.domain.repositories;

import com.lms.backend.domain.entities.Grade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface IGradeRepository extends JpaRepository<Grade, Long> {
    
    @Query("SELECT g FROM Grade g WHERE g.teacher.user.userId = :userId AND g.section = :section")
    List<Grade> findByTeacher_User_UserIdAndSectionGrades(@Param("userId") Long userId, @Param("section") String section);

    Optional<Grade> findByStudentIdAndTeacher_IdAndSection(Long studentId, Long teacherId, String section);

    List<Grade> findByStudentId(Long studentId);
    
    List<Grade> findByTeacher_User_UserIdAndSection(Long userId, String section);

    List<Grade> findByStudent_User_UserId(Long userId);
}
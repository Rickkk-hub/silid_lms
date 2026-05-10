package com.lms.backend.domain.repositories;

import com.lms.backend.domain.entities.Section;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.UUID;
import java.util.List;

public interface ISectionRepository extends JpaRepository<Section, UUID> {
    
    @Query("SELECT s FROM Section s " +
           "LEFT JOIN FETCH s.course " +
           "LEFT JOIN FETCH s.academicYear " +
           "WHERE s.teacher.id = :teacherId")
    List<Section> findByTeacher_Id(@Param("teacherId") UUID teacherId);
}
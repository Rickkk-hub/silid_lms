package com.lms.backend.domain.repositories;

import com.lms.backend.domain.entities.Module;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface IModuleRepository extends JpaRepository<Module, Long> {
    
    // For Teachers: See what they uploaded
    List<Module> findByTeacherId(Long teacherId);

    // For Students: See modules for a specific section name
    List<Module> findBySection(String section);

    // Logic for Student Dashboard: Finds all modules matching the student's enrolled sections
    @Query("SELECT m FROM Module m WHERE m.section IN " +
           "(SELECT e.section FROM Enrollment e WHERE e.student.id = :studentId)")
    List<Module> findAllModulesForStudent(@Param("studentId") Long studentId);
}
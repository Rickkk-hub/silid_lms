package com.lms.backend.domain.repositories;

import com.lms.backend.domain.entities.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.UUID;
import java.util.List;

public interface ITaskRepository extends JpaRepository<Task, UUID> {
    
    // Existing method
    List<Task> findByModuleId(UUID moduleId);

    // NEW: Bridge the gap between Task and Section
    @Query("SELECT t FROM Task t WHERE t.module.section.id = :sectionId")
    List<Task> findBySectionId(@Param("sectionId") UUID sectionId);
}
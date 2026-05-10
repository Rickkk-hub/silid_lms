package com.lms.backend.domain.repositories;

import com.lms.backend.domain.entities.Module;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import java.util.List;

public interface IModuleRepository extends JpaRepository<Module, UUID> {
    List<Module> findBySectionId(UUID sectionId);
}
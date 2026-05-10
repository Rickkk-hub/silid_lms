package com.lms.backend.domain.repositories;

import com.lms.backend.domain.entities.AcademicYear;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface IAcademicYearRepository extends JpaRepository<AcademicYear, UUID> {
    
    // Helpful for the LMS logic to find which year is currently running
    Optional<AcademicYear> findByIsActiveTrue();
    
    // Check if a year/semester combo already exists to avoid duplicates
    boolean existsByYearLabelAndSemester(String yearLabel, String semester);
}
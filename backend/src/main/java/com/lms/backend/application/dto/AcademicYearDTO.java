package com.lms.backend.application.dto;

import lombok.Data;
import java.util.UUID;
import java.time.LocalDate;

@Data
public class AcademicYearDTO {
    private UUID id;
    private String yearLabel; // e.g., "2025-2026"
    private String semester;  // e.g., "1st Semester", "2nd Semester", "Summer"
    private LocalDate startDate;
    private LocalDate endDate;
    private boolean isActive;
}
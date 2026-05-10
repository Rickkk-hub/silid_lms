package com.lms.backend.application.dto;

import lombok.Data;
import java.util.UUID;
import java.time.LocalDateTime;

@Data
public class EnrollmentDTO {
    private UUID id;
    private UUID studentId;
    private UUID sectionId;
    private String status; // ENROLLED, DROPPED, COMPLETED
    private LocalDateTime enrolledAt;
    
    // Extra fields for the React UI (so you don't just see IDs)
    private String studentName;
    private String courseTitle;
}
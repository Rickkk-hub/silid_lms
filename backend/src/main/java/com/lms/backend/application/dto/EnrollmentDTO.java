package com.lms.backend.application.dto;

import lombok.Data;

@Data
public class EnrollmentDTO {
    private Long studentId;  // The ID from the students table
    private Long teacherId;  // The ID from the teachers table
    
    // FIX: Add this field so the Service can call .getCourseId()
    private Long courseId;   
    
    private String semester;
    private String schoolYear;
    private String section;
    private String department;
    private String status;
}
package com.lms.backend.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GradeResponseDTO {
    // Fields for Teacher View
    private String studentName; 
    
    // Fields for Student View (ADD THESE)
    private String courseCode;
    private String courseName;
    
    // Grade Fields
    private Double prelim;
    private Double midterm;
    private Double finals;
    private Double standing;
    private String status;
}
package com.lms.backend.application.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class CourseDTO {
    private UUID id;
    private String code;
    private String title;
    private String department;
    private int units;
    private boolean isActive;
    
    // ADD THESE for the Admin Dashboard Overview
    private String teacherName; // So Noel can see "Dr. Tanaka" in the table
    private String status;      // To show "Active", "Pending", or "Unassigned"
}
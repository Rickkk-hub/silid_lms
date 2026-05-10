package com.lms.backend.application.dto;

import com.lms.backend.domain.entities.Course;
import lombok.Data;
import java.util.UUID;

@Data
public class SectionDTO {
    private UUID id;
    private UUID courseId;
    private UUID teacherId;
    private UUID academicYearId;
    
    // Core Data
    private String name; // e.g., "Section A"
    private String schedule;
    private String room;
    private int maxSlots;

    // UI Enrichment (Ensures TeacherSubject.jsx displays data correctly)
    private String courseCode; 
    private String courseName; 
    private String teacherName; // CRITICAL: This maps to {section.teacherName} in React
    private String academicYearName; 
    
    // NEW: The full Course object for the {section.course?.units} check in React
    private Course course; 
}
package com.lms.backend.application.dto.student;

import lombok.Data;
import java.util.UUID;

@Data
public class StudentDTO {
    private UUID id; // Student Profile ID
    private UUID userId; // Linked User ID
    
    // User fields
    private String fullname;
    private String email;
    private String password;
    
    // Student fields
    private String studentNumber;
    private String program;
    private int yearLevel;
}
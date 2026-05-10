package com.lms.backend.application.dto;

import lombok.Data;

@Data
public class TeacherLoginDTO {
    
    private String fullname;
    private String email;
    private String password;
    private String role = "Teacher";
}

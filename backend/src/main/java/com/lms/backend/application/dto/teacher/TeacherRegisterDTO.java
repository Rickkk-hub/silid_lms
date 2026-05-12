package com.lms.backend.application.dto.teacher;

import lombok.Data;

@Data
public class TeacherRegisterDTO {
    private String fullname;
    private String email;
    private String password;
    private String confirmPassword; // Add this to the DTO
    private String department;
    private String phone_number;
    private String address;
}
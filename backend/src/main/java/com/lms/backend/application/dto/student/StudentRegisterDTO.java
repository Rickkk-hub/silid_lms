package com.lms.backend.application.dto.student;

import lombok.Data;

@Data
public class StudentRegisterDTO {
    private String fullname;
    private String email;
    private String password;
    private String confirmPassword;
    private String course;
    private String year_level;
    private String gender;
    private String birth_date;
    private String address;
    private String phone_number;
}
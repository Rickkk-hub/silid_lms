package com.lms.backend.application.dto;
import lombok.Data;

@Data
public class StudentRegisterDTO {
    private String fullname;
    private String email;
    private String password;
    private String confirmpassword;
    private String role;

}

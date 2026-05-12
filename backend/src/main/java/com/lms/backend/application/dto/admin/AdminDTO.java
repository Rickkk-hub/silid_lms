package com.lms.backend.application.dto.admin;

import lombok.Data;

@Data
public class AdminDTO {
    private Long id;
    private Long userId;
    private String fullname;
    private String email;
    private String role;
}
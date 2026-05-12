package com.lms.backend.application.dto.module;

import lombok.Data;

@Data
public class ModuleDTO {
    private String title;
    private String fileUrl;
    private String description;
    private String section;
    private Long teacherId;
}
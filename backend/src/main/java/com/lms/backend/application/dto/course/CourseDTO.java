package com.lms.backend.application.dto.course;

import lombok.Data;

@Data
public class CourseDTO {
    private Long id;
    private String code;
    private String title;
    private String description;
    private Integer units;
}
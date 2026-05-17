package com.lms.backend.application.dto.course;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CourseDTO {
    private Long id;
    private String code;
    private String title;
    private String department;
    private String description;
    private Integer units;
}
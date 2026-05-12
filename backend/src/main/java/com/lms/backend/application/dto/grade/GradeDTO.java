package com.lms.backend.application.dto.grade;

import lombok.Data;

@Data
public class GradeDTO {
    private Long studentId;
    private Long teacherId;
    private String section;
    private Double prelims;
    private Double midterms;
    private Double finals;
}
package com.lms.backend.application.dto;

import lombok.Data;

@Data
public class EnrollmentDTO {
    private Long enrollmentId;
    private Long studentId;
    private Long teacherId;
    private Long courseId;
    private String semester;
    private String schoolYear;
    private String section;
    private String department;
    private String status;
    private String room;
    private String schedule;
}
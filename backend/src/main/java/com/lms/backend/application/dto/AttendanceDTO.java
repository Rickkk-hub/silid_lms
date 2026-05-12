package com.lms.backend.application.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class AttendanceDTO {
    private Long id;
    private Long studentId;
    private Long teacherId;
    private Long courseId;
    private String section;
    private LocalDate date;
    private String status; // PRESENT, ABSENT, LATE, EXCUSED
    private String remarks;
}
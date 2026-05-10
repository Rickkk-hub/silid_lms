package com.lms.backend.application.dto;

import lombok.*;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AttendanceResponseDTO {

    private UUID id;
    private UUID sectionId;
    private String studentName;
    private String courseCode;
    private String sectionName;
    private LocalDate date;
    private String status;
    private String loggedBy;
}
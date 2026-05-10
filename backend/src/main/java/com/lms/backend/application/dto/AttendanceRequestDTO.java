package com.lms.backend.application.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class AttendanceRequestDTO {

    @NotNull
    private UUID studentId;

    @NotNull
    private UUID sectionId;

    private String status;
    private String remarks;
}
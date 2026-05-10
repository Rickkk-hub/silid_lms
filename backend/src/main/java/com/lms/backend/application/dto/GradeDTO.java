package com.lms.backend.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GradeDTO {
    private UUID id; // Added to match service logic
    private UUID enrollmentId;
    private UUID taskId;
    private Double score;
}
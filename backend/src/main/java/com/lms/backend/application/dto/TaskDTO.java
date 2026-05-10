package com.lms.backend.application.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class TaskDTO {
    private UUID id;
    private UUID moduleId;
    private String title;
    private double maxScore;
    private String type;
}
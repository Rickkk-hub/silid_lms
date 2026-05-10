package com.lms.backend.application.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class ModuleDTO {
    private UUID id;
    private UUID sectionId;
    private String title;
    private String description;
    private boolean isPublished;
}

package com.lms.backend.domain.entities;

import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "academic_years")
@Data
public class AcademicYear {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "year_label", nullable = false)
    private String yearLabel;

    private String semester;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "is_active")
    private boolean isActive = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
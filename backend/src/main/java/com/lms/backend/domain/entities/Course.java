package com.lms.backend.domain.entities;

import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;
import java.time.LocalDateTime;

@Entity
@Table(name = "courses")
@Data
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String code;

    private String title;
    private String department;
    private int units;

    // DAGDAG MO ITO:
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id") // Ito ang magiging column sa database
    private User teacher; 

    @Column(name = "is_active")
    private boolean isActive = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
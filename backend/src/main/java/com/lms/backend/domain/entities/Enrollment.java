package com.lms.backend.domain.entities;

import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;
import java.time.LocalDateTime;

@Entity
@Table(name = "enrollments")
@Data
public class Enrollment {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "student_id")
    private Student student;

    @ManyToOne
    @JoinColumn(name = "section_id")
    private Section section;

    private String status; // e.g., "ENROLLED", "DROPPED", "COMPLETED"

    @Column(name = "enrolled_at")
    private LocalDateTime enrolledAt = LocalDateTime.now();
}
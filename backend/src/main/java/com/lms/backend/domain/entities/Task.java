package com.lms.backend.domain.entities;

import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;
import java.time.LocalDateTime;

@Entity
@Table(name = "tasks")
@Data
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id", nullable = false)
    private Module module;

    private String title;
    private String instructions;
    
    @Column(name = "due_date")
    private LocalDateTime dueDate;

    @Column(name = "max_score")
    private double maxScore;

    private String type; // e.g., "QUIZ", "ASSIGNMENT"
    
    // ADD THIS: This is mandatory for the GradeService calculation logic
    @Column(name = "grading_period")
    private String gradingPeriod; // "PRELIM", "MIDTERM", "FINAL"
}
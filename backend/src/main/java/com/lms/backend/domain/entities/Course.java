package com.lms.backend.domain.entities;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "courses")
@Data
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code; // e.g., "CS311"

    @Column(nullable = false)
    private String title; // e.g., "Data Structures & Algorithms"

    @Column(columnDefinition = "TEXT")
    private String description;

    private Integer units; // e.g., 3
    private String department;
}
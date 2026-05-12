package com.lms.backend.domain.entities;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "modules")
@Data
public class Module {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 1000)
    private String fileUrl; // URL for the document or video

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String section; // The bridge to the Enrollment table

    @ManyToOne
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher; // The instructor who owns the module

    private LocalDateTime uploadedAt = LocalDateTime.now();
}
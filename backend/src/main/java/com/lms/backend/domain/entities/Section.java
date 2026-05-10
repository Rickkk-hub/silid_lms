package com.lms.backend.domain.entities;

import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;

@Entity
@Table(name = "sections")
@Data
public class Section {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    // Directing the database to the 'users' table
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id")
    private User teacher; // CRITICAL: Changed from Teacher to User

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_id")
    private Course course;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "academic_year_id")
    private AcademicYear academicYear;

    private String name;
    private String schedule;
    private String room;
    
    @Column(name = "max_slots")
    private int maxSlots;
}
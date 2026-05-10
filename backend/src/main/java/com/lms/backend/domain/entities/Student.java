package com.lms.backend.domain.entities;

import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;

@Entity
@Table(name = "students")
@Data
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    @Column(name = "student_number", unique = true)
    private String studentNumber;

    private String program; // e.g., "BSIT"
    
    @Column(name = "year_level")
    private int yearLevel;
}
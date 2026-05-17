package com.lms.backend.domain.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "courses")
@Data
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "teacher_id")
    @JsonIgnoreProperties({"courses", "user"}) 
    private Teacher teacher;

    @Column(nullable = false, unique = true)
    private String code; 

    @Column(nullable = false)
    private String title; 

    @Column(columnDefinition = "TEXT")
    private String description;

    private Integer units; 
    private String department;
}
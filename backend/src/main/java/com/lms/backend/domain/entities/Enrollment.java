package com.lms.backend.domain.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "enrollments")
@Data
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_id")
    @JsonIgnoreProperties({"enrollments", "grades"}) // Prevent recursion
    private Course course;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id") // Removed nullable=false for "skeleton" sections
    @JsonIgnoreProperties({"enrollments", "grades", "attendance"}) 
    private Student student;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "teacher_id", nullable = false)
    @JsonIgnoreProperties({"enrollments", "grades", "attendance"})
    private Teacher teacher;

    @Column(nullable = false)
    private String status; // "Enrolled", "Active", "Dropped"

    private String room;
    private String schedule;

    @Column(nullable = false)
    private String semester; 

    @Column(name = "school_year", nullable = false)
    private String schoolYear; 

    private String section; 

    private String department; 

    @Column(name = "enrollment_date")
    private LocalDate enrollmentDate;

    @PrePersist
    protected void onCreate() {
        if (this.enrollmentDate == null) {
            this.enrollmentDate = LocalDate.now();
        }
        if (this.status == null) {
            this.status = "Active";
        }
    }
}
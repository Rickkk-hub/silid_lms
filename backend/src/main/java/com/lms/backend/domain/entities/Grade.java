package com.lms.backend.domain.entities;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "grades")
@Data
public class Grade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    @JsonProperty("prelims") // Force plural naming in JSON output
    private Double prelims;

    @Column(nullable = false)
    @JsonProperty("midterms") // Force plural naming in JSON output
    private Double midterms;

    @Column(nullable = false)
    @JsonProperty("finals") // Force plural naming in JSON output
    private Double finals;

    @JsonProperty("average")
    private Double average;

    private String remarks; // e.g., "Passed", "Failed", "Incomplete"

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;

    @Column(nullable = false)
    private String section;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.updatedAt = LocalDateTime.now();
        calculateAverage();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        calculateAverage();
    }

    public void calculateAverage() {
        if (prelims != null && midterms != null && finals != null) {
            this.average = (prelims + midterms + finals) / 3.0;
            this.remarks = (this.average >= 75) ? "PASSED" : "FAILED";
        }
    }
}
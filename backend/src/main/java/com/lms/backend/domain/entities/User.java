package com.lms.backend.domain.entities;

import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Table(name = "users")
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private String fullname; 

    @Column(unique = true, nullable = false)
    private String email;

    @JsonIgnore 
    @Column(nullable = false)
    private String password;

    // It's good to keep this as a String or Enum ("ADMIN", "TEACHER", "STUDENT")
    private String role; 
    
    @Column(name = "is_active")
    private boolean isActive = true;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonBackReference
    private Teacher teacher;

    // FIX: Added the missing return statement and a fallback
    public String getFullname() {
        if (this.fullname != null && !this.fullname.trim().isEmpty()) {
            return this.fullname;
        }
        return "Unnamed User"; // Fallback so frontend doesn't show blank
    }
}
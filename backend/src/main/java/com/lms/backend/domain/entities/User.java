package com.lms.backend.domain.entities;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "users")
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private long userid;

    private String email;

    private String password;

    @Column(nullable = false)
    private String role;

    @Column(name = "is_active")
    private boolean active;
}
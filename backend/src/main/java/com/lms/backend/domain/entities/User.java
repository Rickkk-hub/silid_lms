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
    private long userId;      

    private String email;

    private String password;

    @Column(name = "fullname")
    private String fullname;

    @Column(nullable = false)
    private String role;

    @Column(name = "is_active")
    private boolean active;
}
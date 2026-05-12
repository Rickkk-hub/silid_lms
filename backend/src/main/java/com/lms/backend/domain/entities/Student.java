package com.lms.backend.domain.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Data;


@Entity
@Data
@Table(name = "students")
public class Student {
     
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String fullname;
    private String email;
    private String role;
    private String course;
    private String year_level;
    private String gender;
    private String birth_date;
    private String address;
    private String phone_number;
    

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
}

package com.lms.backend.application.dto;

import java.util.UUID;

import com.lms.backend.domain.entities.Admin;
import com.lms.backend.domain.entities.Teacher;
import com.lms.backend.domain.entities.Student; 
import com.lms.backend.domain.entities.User;

import lombok.Data;

@Data
public class ResultDTO {
   private boolean success;
   private String message;  
    
   private UUID id;

   private String role;
   private String email;
   private String fullname;

   public User user;
   public Teacher teacher;
   public Admin admin;
   public Student student;

 
}
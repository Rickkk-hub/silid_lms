package com.lms.backend.application.interfaces;
import com.lms.backend.application.dto.StudentLoginDTO;
import com.lms.backend.application.dto.StudentRegisterDTO;
import com.lms.backend.domain.entities.User;

import java.util.List;

import com.lms.backend.application.dto.ResultDTO;


public interface IUserService { 
  ResultDTO StudentRegister(StudentRegisterDTO register);
  ResultDTO StudentLogin(StudentLoginDTO login);

  List<User> getUsersByRole(String role);
  List<User> getAllUsers();
} 
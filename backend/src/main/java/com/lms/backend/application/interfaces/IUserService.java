package com.lms.backend.application.interfaces;
import com.lms.backend.application.dto.student.StudentLoginDTO;
import com.lms.backend.application.dto.student.StudentRegisterDTO;
import com.lms.backend.application.dto.users.ResultDTO;
import com.lms.backend.domain.entities.User;

import java.util.List;


public interface IUserService { 
  ResultDTO StudentRegister(StudentRegisterDTO register);
  ResultDTO StudentLogin(StudentLoginDTO login);

  List<User> findAllByRole(String role);
  List<User> getAllUsers();
} 
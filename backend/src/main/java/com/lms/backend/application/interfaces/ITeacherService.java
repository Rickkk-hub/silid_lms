package com.lms.backend.application.interfaces;

import com.lms.backend.application.dto.teacher.TeacherLoginDTO;
import com.lms.backend.application.dto.teacher.TeacherRegisterDTO;
import com.lms.backend.application.dto.users.ResultDTO;

public interface ITeacherService {
    
    ResultDTO TeacherRegister(TeacherRegisterDTO register);
    ResultDTO TeacherLogin(TeacherLoginDTO login);
}

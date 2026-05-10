package com.lms.backend.application.interfaces;

import com.lms.backend.application.dto.ResultDTO;
import com.lms.backend.application.dto.TeacherLoginDTO;
import com.lms.backend.application.dto.TeacherRegisterDTO;

public interface ITeacherService {
    
    ResultDTO TeacherRegister(TeacherRegisterDTO register);
    ResultDTO TeacherLogin(TeacherLoginDTO login);
}

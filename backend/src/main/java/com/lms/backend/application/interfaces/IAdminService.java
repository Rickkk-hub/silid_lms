package com.lms.backend.application.interfaces;

import com.lms.backend.application.dto.ResultDTO;
import com.lms.backend.application.dto.AdminRegisterDTO;
import com.lms.backend.application.dto.AdminLoginDTO;
public interface IAdminService {

    ResultDTO AdminRegister(AdminRegisterDTO register);
    ResultDTO AdminLogin(AdminLoginDTO login);
}
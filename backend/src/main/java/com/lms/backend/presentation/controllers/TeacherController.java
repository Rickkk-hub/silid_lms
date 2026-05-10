package com.lms.backend.presentation.controllers;

import com.lms.backend.application.dto.ResultDTO;
import com.lms.backend.application.dto.TeacherLoginDTO;
import com.lms.backend.application.dto.TeacherRegisterDTO;
import com.lms.backend.application.interfaces.ITeacherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/teacher")
@RequiredArgsConstructor
public class TeacherController {

    private final ITeacherService teacherService;

    @PostMapping("/TeacherRegister")
    public ResponseEntity<ResultDTO> register(@RequestBody TeacherRegisterDTO register) {
        ResultDTO result = teacherService.TeacherRegister(register);
        
        if (result.isSuccess()) {
            return ResponseEntity.ok(result);
        }
        return ResponseEntity.badRequest().body(result);
    }

    @PostMapping("/TeacherLogin")
    public ResponseEntity<ResultDTO> login(@RequestBody TeacherLoginDTO login) {
        ResultDTO result = teacherService.TeacherLogin(login);
        
        if (result.isSuccess()) {
            return ResponseEntity.ok(result);
        }
        // 401 Unauthorized for failed login
        return ResponseEntity.status(401).body(result);
    }
}
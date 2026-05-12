package com.lms.backend.presentation.controllers;

import com.lms.backend.application.dto.student.StudentLoginDTO;
import com.lms.backend.application.dto.student.StudentRegisterDTO;
import com.lms.backend.application.dto.users.ResultDTO;
import com.lms.backend.application.interfaces.IUserService;
import com.lms.backend.presentation.auth.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final IUserService userService;
    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ResultDTO> login(@RequestBody StudentLoginDTO loginDTO) {
        // This is the core logic: validate password in 'users' table, 
        // then fetch 'fullname' using the @JoinColumn link.
        ResultDTO result = authService.login(loginDTO.getEmail(), loginDTO.getPassword());
        
        if (result.isSuccess()) {
            return ResponseEntity.ok(result);
        }
        return ResponseEntity.status(401).body(result);
    }

    @PostMapping("/register")
    public ResponseEntity<ResultDTO> register(@RequestBody StudentRegisterDTO registerDTO) {
        ResultDTO result = userService.StudentRegister(registerDTO);
        return result.isSuccess() ? ResponseEntity.ok(result) : ResponseEntity.badRequest().body(result);
    }

    @GetMapping("/role/{role}")
    public ResponseEntity<List<?>> getUsersByRole(@PathVariable String role) {
        return ResponseEntity.ok(userService.findAllByRole(role));
    }
}
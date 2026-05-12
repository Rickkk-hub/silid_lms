package com.lms.backend.presentation.auth;

import com.lms.backend.application.dto.users.ResultDTO;
import com.lms.backend.domain.entities.User;
import com.lms.backend.domain.repositories.IUserRepository;
import com.lms.backend.domain.repositories.IAdminRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final IUserRepository userRepository;
    private final IAdminRepository adminRepository; // Add this
    private final PasswordEncoder passwordEncoder;

    public ResultDTO login(String email, String password) {
        ResultDTO result = new ResultDTO();
        var userOpt = userRepository.findByEmail(email);

        if (userOpt.isPresent()) {
            User user = userOpt.get();

            if (passwordEncoder.matches(password, user.getPassword())) {
                result.setSuccess(true);

                // ENSURE THIS IS SET
                String role = user.getRole() != null ? user.getRole() : "ADMIN";
                result.setRole(role);

                result.setMessage(role + " Access Granted");

                // This helper MUST set the role field inside result
                result.populateFromUser(user);

                if ("ADMIN".equals(role.toUpperCase())) {
                    adminRepository.findByUserUserid(user.getUserid())
                            .ifPresent(admin -> result.setFullname(admin.getFullname()));
                }

                return result;
            }
        }

        result.setSuccess(false);
        result.setMessage("Invalid email or password");
        return result;
    }
}
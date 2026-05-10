package com.lms.backend.application.services;

import com.lms.backend.application.dto.StudentLoginDTO;
import com.lms.backend.application.dto.StudentRegisterDTO;
import com.lms.backend.application.dto.ResultDTO;
import com.lms.backend.application.interfaces.IUserService;
import com.lms.backend.domain.entities.User;
import com.lms.backend.domain.repositories.IUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService implements IUserService {

    private final IUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public List<User> getUsersByRole(String role) {
        // Normalizing role to uppercase to match DB storage (e.g., "TEACHER")
        return userRepository.findByRole(role.toUpperCase());
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public ResultDTO StudentRegister(StudentRegisterDTO register) {
        ResultDTO result = new ResultDTO();
        try {
            if (!register.getPassword().equals(register.getConfirmpassword())) {
                throw new Exception("Passwords do not match!");
            }

            if (userRepository.findByEmail(register.getEmail()).isPresent()) {
                throw new Exception("A user with this email already exists!");
            }

            User user = new User();
            user.setFullname(register.getFullname());
            user.setEmail(register.getEmail());
            user.setPassword(passwordEncoder.encode(register.getPassword()));
            
            // Default to STUDENT if no role provided, otherwise normalize to UPPERCASE
            String assignedRole = (register.getRole() != null && !register.getRole().isEmpty()) 
                                  ? register.getRole().toUpperCase() 
                                  : "STUDENT";
            user.setRole(assignedRole);
            user.setActive(true);

            User savedUser = userRepository.save(user);

            result.setSuccess(true);
            result.setMessage(savedUser.getRole() + " Successfully Registered!");
            result.setId(savedUser.getId());
            result.setRole(savedUser.getRole());
            result.setFullname(savedUser.getFullname());

        } catch (Exception e) {
            result.setSuccess(false);
            result.setMessage(e.getMessage());
        }
        return result;
    }

    @Override
    public ResultDTO StudentLogin(StudentLoginDTO login) {
        ResultDTO result = new ResultDTO();
        try {
            // This is the CRITICAL part: it only searches the IUserRepository (users table)
            User user = userRepository.findByEmail(login.getEmail())
                    .orElseThrow(() -> new Exception("Invalid email or password!"));

            if (!passwordEncoder.matches(login.getPassword(), user.getPassword())) {
                throw new Exception("Invalid email or password!");
            }

            result.setSuccess(true);
            result.setMessage("Login successful!");
            
            // We pass the full User entity. The frontend will grab user.id (the new UUID)
            result.setUser(user);
            result.setId(user.getId()); // Explicitly set ID for the ResultDTO
            result.setRole(user.getRole());
            result.setFullname(user.getFullname());

        } catch (Exception e) {
            result.setSuccess(false);
            result.setMessage(e.getMessage());
        }
        return result;
    }
}
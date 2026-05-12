package com.lms.backend.application.dto.users;

import com.lms.backend.domain.entities.User;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ResultDTO {
    private boolean success;
    private String message;
    private long userid;
    private String role;
    private String email;
    private String fullname;
    private User user;

    // ADD THIS CONSTRUCTOR MANUALLY
    // This allows the "new ResultDTO(true, "message")" calls to work
    public ResultDTO(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public void populateFromUser(User userEntity) {
        this.user = userEntity;
        if (userEntity != null) {
            this.userid = userEntity.getUserid();
            this.role = userEntity.getRole();
            this.email = userEntity.getEmail();
        }
    }
}
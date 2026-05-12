package com.lms.backend.domain.repositories;

import com.lms.backend.domain.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface IUserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
    List<User> findAllByRole(String role);
    long countByRole(String role);

    // FIX: Changed 'Id' to 'Userid' and 'UUID' to 'long'
    Optional<User> findByUseridAndRole(long userid, String role);
}
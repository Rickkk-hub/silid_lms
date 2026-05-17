package com.lms.backend.domain.repositories;

import com.lms.backend.domain.entities.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface IAdminRepository extends JpaRepository<Admin, Long> {
    // Used to link the Admin profile during login or dashboard load
    Optional<Admin> findByUserUserId(long userid);
}
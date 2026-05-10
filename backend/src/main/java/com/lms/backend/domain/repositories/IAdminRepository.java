package com.lms.backend.domain.repositories;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import com.lms.backend.domain.entities.Admin;


public interface IAdminRepository extends JpaRepository<Admin, UUID >{
  Optional<Admin>findByEmail(String email);
    
}


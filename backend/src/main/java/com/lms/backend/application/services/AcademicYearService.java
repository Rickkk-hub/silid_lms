package com.lms.backend.application.services;

import com.lms.backend.application.dto.AcademicYearDTO;
import com.lms.backend.domain.entities.AcademicYear;
import com.lms.backend.domain.repositories.IAcademicYearRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AcademicYearService {
    private final IAcademicYearRepository repository;

    public List<AcademicYearDTO> findAll() {
        return repository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public AcademicYearDTO save(AcademicYearDTO dto) {
        AcademicYear entity = new AcademicYear();
        entity.setYearLabel(dto.getYearLabel());
        entity.setSemester(dto.getSemester());
        entity.setStartDate(dto.getStartDate());
        entity.setEndDate(dto.getEndDate());
        entity.setActive(dto.isActive());
        
        return mapToDTO(repository.save(entity));
    }

    private AcademicYearDTO mapToDTO(AcademicYear entity) {
        AcademicYearDTO dto = new AcademicYearDTO();
        dto.setId(entity.getId());
        dto.setYearLabel(entity.getYearLabel());
        dto.setSemester(entity.getSemester());
        dto.setStartDate(entity.getStartDate());
        dto.setEndDate(entity.getEndDate());
        dto.setActive(entity.isActive());
        return dto;
    }
}
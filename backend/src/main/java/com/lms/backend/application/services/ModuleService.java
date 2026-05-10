package com.lms.backend.application.services;

import com.lms.backend.application.dto.ModuleDTO;
import com.lms.backend.domain.entities.Module;
import com.lms.backend.domain.repositories.IModuleRepository;
import com.lms.backend.domain.repositories.ISectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ModuleService {
    private final IModuleRepository moduleRepository;
    private final ISectionRepository sectionRepository;

    public ModuleDTO createModule(ModuleDTO dto) {
        Module module = new Module();
        module.setSection(sectionRepository.findById(dto.getSectionId()).orElseThrow());
        module.setTitle(dto.getTitle());
        module.setDescription(dto.getDescription());
        module.setPublished(dto.isPublished());
        
        Module saved = moduleRepository.save(module);
        return mapToDTO(saved);
    }

    public List<ModuleDTO> getBySection(UUID sectionId) {
        return moduleRepository.findBySectionId(sectionId).stream()
                .map(this::mapToDTO).collect(Collectors.toList());
    }

    private ModuleDTO mapToDTO(Module m) {
        ModuleDTO dto = new ModuleDTO();
        dto.setId(m.getId());
        dto.setSectionId(m.getSection().getId());
        dto.setTitle(m.getTitle());
        dto.setDescription(m.getDescription());
        dto.setPublished(m.isPublished());
        return dto;
    }
}
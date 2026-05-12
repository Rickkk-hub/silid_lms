package com.lms.backend.application.services;

import com.lms.backend.application.dto.module.ModuleDTO;
import com.lms.backend.application.dto.users.ResultDTO;
import com.lms.backend.domain.entities.Module;
import com.lms.backend.domain.entities.Teacher;
import com.lms.backend.domain.repositories.IModuleRepository;
import com.lms.backend.domain.repositories.ITeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ModuleService {

    private final IModuleRepository moduleRepository;
    private final ITeacherRepository teacherRepository;

    public ResultDTO saveModule(ModuleDTO dto) {
        ResultDTO result = new ResultDTO();
        try {
            Teacher teacher = teacherRepository.findById(dto.getTeacherId())
                    .orElseThrow(() -> new Exception("Instructor profile not found"));

            Module module = new Module();
            module.setTitle(dto.getTitle());
            module.setFileUrl(dto.getFileUrl());
            module.setDescription(dto.getDescription());
            module.setSection(dto.getSection());
            module.setTeacher(teacher);

            moduleRepository.save(module);

            result.setSuccess(true);
            result.setMessage("Module '" + dto.getTitle() + "' is now live for section " + dto.getSection());
        } catch (Exception e) {
            result.setSuccess(false);
            result.setMessage(e.getMessage());
        }
        return result;
    }
}
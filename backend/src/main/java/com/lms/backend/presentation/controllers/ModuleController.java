package com.lms.backend.presentation.controllers;

import com.lms.backend.application.dto.module.ModuleDTO;
import com.lms.backend.application.dto.users.ResultDTO;
import com.lms.backend.application.services.ModuleService;
import com.lms.backend.domain.entities.Module;
import com.lms.backend.domain.repositories.IModuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/modules")
@RequiredArgsConstructor
public class ModuleController {

    private final ModuleService moduleService;
    private final IModuleRepository moduleRepository;

    @PostMapping("/upload")
    public ResponseEntity<ResultDTO> upload(@RequestBody ModuleDTO dto) {
        return ResponseEntity.ok(moduleService.saveModule(dto));
    }

    // Teacher View: Get their own modules
    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<Module>> getTeacherModules(@PathVariable Long teacherId) {
        return ResponseEntity.ok(moduleRepository.findByTeacherId(teacherId));
    }

    // Student View: Get all modules for all sections the student is enrolled in
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Module>> getStudentModules(@PathVariable Long studentId) {
        return ResponseEntity.ok(moduleRepository.findAllModulesForStudent(studentId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteModule(@PathVariable Long id) {
        moduleRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping
  public ResponseEntity<List<Module>> getAllModules() {
    return ResponseEntity.ok(moduleRepository.findAll());
   }
}
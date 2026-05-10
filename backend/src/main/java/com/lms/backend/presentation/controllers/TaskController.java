package com.lms.backend.presentation.controllers;


import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lms.backend.application.dto.TaskDTO;
import com.lms.backend.application.services.TaskService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {
    private final TaskService taskService;

    @PostMapping
    public ResponseEntity<TaskDTO> create(@RequestBody TaskDTO dto) {
        return ResponseEntity.ok(taskService.createTask(dto));
    }

   @GetMapping("/module/{moduleId}")
    public ResponseEntity<List<TaskDTO>> listByModule(@PathVariable UUID moduleId) {
        return ResponseEntity.ok(taskService.getByModule(moduleId));
    }

    // ADD THIS GET MAPPING
    @GetMapping("/section/{sectionId}")
    public ResponseEntity<List<TaskDTO>> listBySection(@PathVariable UUID sectionId) {
        return ResponseEntity.ok(taskService.getBySection(sectionId));
    }
}
package com.lms.backend.presentation.controllers;

import com.lms.backend.application.dto.SectionDTO;
import com.lms.backend.application.services.SectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/sections")
@RequiredArgsConstructor
public class SectionController {

    private final SectionService sectionService;

    @PostMapping
    public ResponseEntity<SectionDTO> create(@RequestBody SectionDTO dto) {
        return ResponseEntity.ok(sectionService.createSection(dto));
    }

    @GetMapping
    public ResponseEntity<List<SectionDTO>> getAll() {
        return ResponseEntity.ok(sectionService.getAllSections());
    }

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<SectionDTO>> getByTeacher(@PathVariable UUID teacherId) {
        // This now calls the correctly defined method in Service
        return ResponseEntity.ok(sectionService.getSectionsByTeacher(teacherId));
    }
}
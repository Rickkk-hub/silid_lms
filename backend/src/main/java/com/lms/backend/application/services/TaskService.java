package com.lms.backend.application.services;

import com.lms.backend.application.dto.TaskDTO;
import com.lms.backend.domain.entities.Task;
import com.lms.backend.domain.repositories.IModuleRepository;
import com.lms.backend.domain.repositories.ITaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {
    private final ITaskRepository taskRepository;
    private final IModuleRepository moduleRepository;

    public List<TaskDTO> getBySection(UUID sectionId) {
        return taskRepository.findBySectionId(sectionId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public TaskDTO createTask(TaskDTO dto) {
        Task task = new Task();
        task.setModule(moduleRepository.findById(dto.getModuleId()).orElseThrow());
        task.setTitle(dto.getTitle());
        task.setMaxScore(dto.getMaxScore());
        task.setType(dto.getType());
        
        Task saved = taskRepository.save(task);
        return mapToDTO(saved);
    }

    public List<TaskDTO> getByModule(UUID moduleId) {
        return taskRepository.findByModuleId(moduleId).stream()
                .map(this::mapToDTO).collect(Collectors.toList());
    }

  private TaskDTO mapToDTO(Task t) {
        TaskDTO dto = new TaskDTO();
        dto.setId(t.getId());
        dto.setModuleId(t.getModule().getId());
        dto.setTitle(t.getTitle());
        dto.setMaxScore(t.getMaxScore());
        dto.setType(t.getType());
        // Ensure your TaskDTO has a gradingPeriod field if you want to show it in UI
        return dto;
    }
}
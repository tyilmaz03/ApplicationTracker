package com.example.application_tracker.web.controller;

import com.example.application_tracker.web.dto.ApplicationCreateRequest;
import com.example.application_tracker.web.dto.ApplicationResponse;
import com.example.application_tracker.app.service.ApplicationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/applications")
public class ApplicationController {

    private final ApplicationService service;

    public ApplicationController(ApplicationService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<ApplicationResponse> createApplication(
            @Valid @RequestBody ApplicationCreateRequest request) {
        ApplicationResponse created = service.createApplication(request);
        return ResponseEntity.status(201).body(created);
    }

    @GetMapping
    public List<ApplicationResponse> getAll() {
        return service.getAllApplications();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApplicationResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getApplication(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable UUID id) {
        service.deleteApplication(id);
        return ResponseEntity.ok(Map.of("message", "Application deleted successfully"));
    }
}

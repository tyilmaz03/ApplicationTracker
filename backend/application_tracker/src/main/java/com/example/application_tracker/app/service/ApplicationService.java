package com.example.application_tracker.app.service;

import com.example.application_tracker.app.mapper.ApplicationMapper;
import com.example.application_tracker.core.exception.BadRequestException;
import com.example.application_tracker.core.exception.ResourceNotFoundException;
import com.example.application_tracker.core.model.Application;
import com.example.application_tracker.core.model.Contacts;
import com.example.application_tracker.data.ApplicationRepository;
import com.example.application_tracker.web.dto.ApplicationCreateRequest;
import com.example.application_tracker.web.dto.ApplicationResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ApplicationService {

    private final ApplicationRepository repository;
    private final ApplicationMapper mapper;

    public ApplicationService(ApplicationRepository repository, ApplicationMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    // --------------------------------------------------
    // CREATE
    // --------------------------------------------------
    public ApplicationResponse createApplication(ApplicationCreateRequest req) {
        List<String> errors = new java.util.ArrayList<>();

        if (req.getCompanyName() == null || req.getCompanyName().isBlank())
            errors.add("Company name is required");
        if (req.getJobTitle() == null || req.getJobTitle().isBlank())
            errors.add("Job title is required");
        if (req.getStatus() == null || req.getStatus().isBlank())
            errors.add("Status is required");
        if (req.getApplicationDate() == null)
            errors.add("Application date is required");

        if (!errors.isEmpty())
            throw new BadRequestException(errors);

        // Vérifie que la publication précède la candidature
        if (req.getPublicationDate() != null && req.getApplicationDate() != null
                && req.getPublicationDate().isAfter(req.getApplicationDate())) {
            throw new BadRequestException(List.of("Publication date cannot be after application date"));
        }

        // Crée les contacts si fournis
        Contacts contacts = null;
        if (req.getContacts() != null) {
            contacts = new Contacts(
                    req.getContacts().getNames(),
                    req.getContacts().getEmails(),
                    req.getContacts().getDomains(),
                    req.getContacts().getPhones()
            );
        }

        // ✅ Utilisation du constructeur public de Application
        Application entity = new Application(
                req.getCompanyName(),
                req.getJobTitle(),
                req.getJobLink(),
                req.getCountry(),
                req.getPublicationDate(),
                req.getApplicationDate(),
                req.getStatus(),
                contacts,
                req.getFollowUpDates(),
                req.getSentFiles()
        );

        Application saved = repository.save(entity);
        return mapper.toResponse(saved);
    }

    // --------------------------------------------------
    // READ (all)
    // --------------------------------------------------
    public List<ApplicationResponse> getAllApplications() {
        return repository.findAll()
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    // --------------------------------------------------
    // READ (by ID)
    // --------------------------------------------------
    public ApplicationResponse getApplication(UUID id) {
        Application app = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + id));
        return mapper.toResponse(app);
    }

    // --------------------------------------------------
    // UPDATE (partial update)
    // --------------------------------------------------
    @Transactional
    public ApplicationResponse updateApplication(UUID id, ApplicationCreateRequest req) {
        Application existing = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + id));

        if (req == null)
            throw new BadRequestException(List.of("Update request cannot be null"));

        if (req.getPublicationDate() != null && req.getApplicationDate() != null
                && req.getPublicationDate().isAfter(req.getApplicationDate())) {
            throw new BadRequestException(List.of("Publication date cannot be after application date"));
        }

        if (req.getCompanyName() != null && !req.getCompanyName().isBlank())
            existing.setCompanyName(req.getCompanyName());

        if (req.getJobTitle() != null && !req.getJobTitle().isBlank())
            existing.setJobTitle(req.getJobTitle());

        if (req.getJobLink() != null)
            existing.setJobLink(req.getJobLink());

        if (req.getCountry() != null)
            existing.setCountry(req.getCountry());

        if (req.getPublicationDate() != null)
            existing.setPublicationDate(req.getPublicationDate());

        if (req.getApplicationDate() != null)
            existing.setApplicationDate(req.getApplicationDate());

        if (req.getStatus() != null && !req.getStatus().isBlank())
            existing.setStatus(req.getStatus());

        if (req.getContacts() != null) {
            existing.setContacts(new Contacts(
                    req.getContacts().getNames(),
                    req.getContacts().getEmails(),
                    req.getContacts().getDomains(),
                    req.getContacts().getPhones()
            ));
        }

        if (req.getFollowUpDates() != null)
            existing.setFollowUpDates(req.getFollowUpDates());

        if (req.getSentFiles() != null)
            existing.setSentFiles(req.getSentFiles());

        Application updated = repository.save(existing);
        return mapper.toResponse(updated);
    }

    // --------------------------------------------------
    // DELETE
    // --------------------------------------------------
    public void deleteApplication(UUID id) {
        Application existing = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + id));

        repository.delete(existing);
    }
}

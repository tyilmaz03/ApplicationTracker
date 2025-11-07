package com.example.application_tracker.app.mapper;

import com.example.application_tracker.core.model.Application;
import com.example.application_tracker.web.dto.ApplicationResponse;
import org.springframework.stereotype.Component;

@Component
public class ApplicationMapper {

    public ApplicationResponse toResponse(Application entity) {
        ApplicationResponse dto = new ApplicationResponse();
        dto.setId(entity.getId());
        dto.setCompanyName(entity.getCompanyName());
        dto.setJobTitle(entity.getJobTitle());
        dto.setJobLink(entity.getJobLink());
        dto.setCountry(entity.getCountry());
        dto.setPublicationDate(entity.getPublicationDate());
        dto.setApplicationDate(entity.getApplicationDate());
        dto.setStatus(entity.getStatus());
        dto.setFollowUpDates(entity.getFollowUpDates());
        dto.setSentFiles(entity.getSentFiles());

        if (entity.getContacts() != null) {
            dto.setContacts(new com.example.application_tracker.web.dto.ContactsDTO(
                entity.getContacts().getNames(),
                entity.getContacts().getEmails(),
                entity.getContacts().getDomains(),
                entity.getContacts().getPhones()
            ));
        }

        return dto;
    }
}

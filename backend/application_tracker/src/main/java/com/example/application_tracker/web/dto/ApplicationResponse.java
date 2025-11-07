package com.example.application_tracker.web.dto;

import lombok.*;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationResponse {
    private UUID id;
    private String companyName;
    private String jobTitle;
    private String jobLink;
    private String country;
    private LocalDate publicationDate;
    private LocalDate applicationDate;
    private String status;
    private ContactsDTO contacts;
    private List<LocalDate> followUpDates;
    private List<String> sentFiles;
}

package com.example.application_tracker.web.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class ApplicationCreateRequest {

    @NotBlank
    private String companyName;

    @NotBlank
    private String jobTitle;

    private String jobLink;

    private String country;

    private LocalDate publicationDate;

    @NotNull
    private LocalDate applicationDate;

    @NotBlank
    private String status;

    @Valid
    private ContactsDTO contacts;

    private List<LocalDate> followUpDates;

    private List<String> sentFiles;
}

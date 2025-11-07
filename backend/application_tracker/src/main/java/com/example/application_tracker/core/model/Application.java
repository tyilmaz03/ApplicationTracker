package com.example.application_tracker.core.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "applications")
public class Application implements Serializable {

    @Id
    @GeneratedValue(generator = "uuid")
    @GenericGenerator(name = "uuid", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(nullable = false)
    private String companyName;

    @Column(nullable = false)
    private String jobTitle;

    @Column
    private String jobLink;

    @Column(length = 5)
    private String country;

    @Column
    private LocalDate publicationDate;

    @Column(nullable = false)
    private LocalDate applicationDate;

    @Column(nullable = false)
    private String status;

    @Embedded
    private Contacts contacts;

    @ElementCollection
    @CollectionTable(name = "application_followups", joinColumns = @JoinColumn(name = "application_id"))
    @Column(name = "followup_date")
    private List<LocalDate> followUpDates;

    @ElementCollection
    @CollectionTable(name = "application_files", joinColumns = @JoinColumn(name = "application_id"))
    @Column(name = "file_name")
    private List<String> sentFiles;

    public Application(String companyName, String jobTitle, String jobLink, String country,
                       LocalDate publicationDate, LocalDate applicationDate, String status,
                       Contacts contacts, List<LocalDate> followUpDates, List<String> sentFiles) {
        this.companyName = companyName;
        this.jobTitle = jobTitle;
        this.jobLink = jobLink;
        this.country = country;
        this.publicationDate = publicationDate;
        this.applicationDate = applicationDate;
        this.status = status;
        this.contacts = contacts;
        this.followUpDates = followUpDates;
        this.sentFiles = sentFiles;
    }
}
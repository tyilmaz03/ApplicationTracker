package com.example.application_tracker.core.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Contacts {

    @ElementCollection
    @CollectionTable(name = "contact_names", joinColumns = @JoinColumn(name = "application_id"))
    @Column(name = "name")
    private List<String> names;

    @ElementCollection
    @CollectionTable(name = "contact_emails", joinColumns = @JoinColumn(name = "application_id"))
    @Column(name = "email")
    private List<String> emails;

    @ElementCollection
    @CollectionTable(name = "contact_domains", joinColumns = @JoinColumn(name = "application_id"))
    @Column(name = "domain")
    private List<String> domains;

    @ElementCollection
    @CollectionTable(name = "contact_phones", joinColumns = @JoinColumn(name = "application_id"))
    @Column(name = "phone")
    private List<String> phones;
}

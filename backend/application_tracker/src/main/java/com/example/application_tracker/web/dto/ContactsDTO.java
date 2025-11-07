package com.example.application_tracker.web.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ContactsDTO {
    private List<String> names;
    private List<String> emails;
    private List<String> domains;
    private List<String> phones;
}

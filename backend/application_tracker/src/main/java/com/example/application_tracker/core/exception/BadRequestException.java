package com.example.application_tracker.core.exception;

import java.util.List;

public class BadRequestException extends RuntimeException {

    private final List<String> errors;

    public BadRequestException(String message) {
        super(message);
        this.errors = List.of(message);
    }

    public BadRequestException(List<String> errors) {
        super(String.join("; ", errors));
        this.errors = errors;
    }

    public List<String> getErrors() {
        return errors;
    }
}
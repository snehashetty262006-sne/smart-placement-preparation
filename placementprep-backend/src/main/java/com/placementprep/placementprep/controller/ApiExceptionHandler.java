package com.placementprep.placementprep.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(ApiExceptionHandler.class);

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrityViolation(
            DataIntegrityViolationException exception,
            HttpServletRequest request
    ) {
        logger.warn("Database constraint violation for {} {}", request.getMethod(), request.getRequestURI(), exception);
        return errorResponse(
                HttpStatus.CONFLICT,
                "The request conflicts with existing data. Check whether this email is already registered.",
                request
        );
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<Map<String, Object>> handleDataAccessException(
            DataAccessException exception,
            HttpServletRequest request
    ) {
        logger.error("Database request failed for {} {}", request.getMethod(), request.getRequestURI(), exception);
        return errorResponse(
                HttpStatus.SERVICE_UNAVAILABLE,
                "The database request failed. Check that MySQL is running and the backend database settings are correct.",
                request
        );
    }

    private ResponseEntity<Map<String, Object>> errorResponse(
            HttpStatus status,
            String message,
            HttpServletRequest request
    ) {
        return ResponseEntity.status(status).body(Map.of(
                "status", status.value(),
                "message", message,
                "path", request.getRequestURI()
        ));
    }
}

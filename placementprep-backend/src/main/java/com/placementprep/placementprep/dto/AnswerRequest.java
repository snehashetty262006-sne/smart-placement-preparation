package com.placementprep.placementprep.dto;

import jakarta.validation.constraints.NotBlank;

public record AnswerRequest(@NotBlank String answer) {
}

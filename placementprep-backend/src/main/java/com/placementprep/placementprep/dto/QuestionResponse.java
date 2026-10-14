package com.placementprep.placementprep.dto;

import com.placementprep.placementprep.Entity.Question;

public record QuestionResponse(
        Long id,
        String questionText,
        String optionA,
        String optionB,
        String optionC,
        String optionD,
        String category,
        String difficulty
) {
    public static QuestionResponse from(Question question) {
        return new QuestionResponse(
                question.getId(),
                question.getQuestionText(),
                question.getOptionA(),
                question.getOptionB(),
                question.getOptionC(),
                question.getOptionD(),
                question.getCategory(),
                question.getDifficulty()
        );
    }
}

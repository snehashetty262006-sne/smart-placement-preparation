package com.placementprep.placementprep.service;

import com.placementprep.placementprep.Entity.Question;
import com.placementprep.placementprep.dto.AnswerResult;
import com.placementprep.placementprep.dto.QuestionResponse;
import com.placementprep.placementprep.repository.QuestionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
public class QuestionService {

    private final QuestionRepository questionRepository;

    public QuestionService(QuestionRepository questionRepository) {
        this.questionRepository = questionRepository;
    }

    public Question saveQuestion(Question question) {
        return questionRepository.save(question);
    }

    public List<QuestionResponse> getAllQuestions() {
        return questionRepository.findAll().stream()
                .map(QuestionResponse::from)
                .toList();
    }

    public Optional<QuestionResponse> getQuestionById(Long id) {
        return questionRepository.findById(id).map(QuestionResponse::from);
    }

    public AnswerResult checkAnswer(Long id, String answer) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Question not found"));
        String submittedAnswer = resolveOption(question, answer);
        String correctAnswer = resolveOption(question, question.getCorrectAnswer());

        if (submittedAnswer == null || correctAnswer == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Answer must match one of the available options");
        }

        return new AnswerResult(correctAnswer.equalsIgnoreCase(submittedAnswer), correctAnswer);
    }

    public void deleteQuestion(Long id) {
        questionRepository.deleteById(id);
    }

    private String resolveOption(Question question, String answer) {
        if (answer == null) {
            return null;
        }

        String normalized = answer.trim();
        if (normalized.length() == 1) {
            return switch (normalized.toUpperCase()) {
                case "A" -> question.getOptionA();
                case "B" -> question.getOptionB();
                case "C" -> question.getOptionC();
                case "D" -> question.getOptionD();
                default -> normalized;
            };
        }

        return normalized;
    }
}

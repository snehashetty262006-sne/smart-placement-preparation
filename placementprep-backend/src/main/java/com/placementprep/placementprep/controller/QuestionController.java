package com.placementprep.placementprep.controller;

import com.placementprep.placementprep.Entity.Question;
import com.placementprep.placementprep.dto.AnswerRequest;
import com.placementprep.placementprep.dto.AnswerResult;
import com.placementprep.placementprep.dto.QuestionResponse;
import com.placementprep.placementprep.service.QuestionService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/questions")
public class QuestionController {

    private final QuestionService questionService;

    public QuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }

    @PostMapping
    public QuestionResponse createQuestion(@RequestBody Question question) {
        return QuestionResponse.from(questionService.saveQuestion(question));
    }

    @GetMapping
    public List<QuestionResponse> getAllQuestions() {
        return questionService.getAllQuestions();
    }

    @GetMapping("/{id}")
    public Optional<QuestionResponse> getQuestionById(@PathVariable Long id) {
        return questionService.getQuestionById(id);
    }

    @PostMapping("/{id}/answer")
    public AnswerResult checkAnswer(@PathVariable Long id, @Valid @RequestBody AnswerRequest request) {
        return questionService.checkAnswer(id, request.answer());
    }

    @DeleteMapping("/{id}")
    public String deleteQuestion(@PathVariable Long id) {
        questionService.deleteQuestion(id);
        return "Question deleted successfully";
    }
}
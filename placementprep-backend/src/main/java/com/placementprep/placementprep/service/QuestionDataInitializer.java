package com.placementprep.placementprep.service;

import com.placementprep.placementprep.Entity.Question;
import com.placementprep.placementprep.repository.QuestionRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class QuestionDataInitializer implements CommandLineRunner {

    private final QuestionRepository questionRepository;

    public QuestionDataInitializer(QuestionRepository questionRepository) {
        this.questionRepository = questionRepository;
    }

    @Override
    public void run(String... args) {
        List<Question> aptitudeQuestions = List.of(
                question("What is 25% of 240?", "40", "50", "60", "80", "60", "Quantitative", "Easy"),
                question("A number is increased from 80 to 100. What is the percentage increase?", "20%", "25%", "30%", "40%", "25%", "Quantitative", "Easy"),
                question("Twelve workers complete a task in 10 days. At the same rate, how many days will 6 workers need?", "5 days", "10 days", "15 days", "20 days", "20 days", "Quantitative", "Medium"),
                question("Find the next number in the sequence: 2, 6, 12, 20, 30, __.", "36", "40", "42", "44", "42", "Logical Reasoning", "Easy"),
                question("If every Glim is a Nop and every Nop is a Vek, which statement must be true?", "Every Vek is a Glim", "Every Glim is a Vek", "No Glim is a Vek", "Some Nops are not Veks", "Every Glim is a Vek", "Logical Reasoning", "Medium"),
                question("Maya walks 4 km north, then 3 km east. In which direction is she from her starting point?", "North", "East", "North-east", "South-east", "North-east", "Logical Reasoning", "Easy"),
                question("Choose the word closest in meaning to 'concise'.", "Brief", "Unclear", "Detailed", "Cautious", "Brief", "Verbal Ability", "Easy"),
                question("Choose the correctly spelled word.", "Accomodate", "Acommodate", "Accommodate", "Acomodate", "Accommodate", "Verbal Ability", "Medium"),
                question("Complete the sentence: Neither the coach nor the players ___ ready.", "is", "was", "are", "has", "are", "Verbal Ability", "Medium")
        );

        for (String category : List.of("Quantitative", "Logical Reasoning", "Verbal Ability")) {
            if (!questionRepository.existsByCategoryIgnoreCase(category)) {
                questionRepository.saveAll(aptitudeQuestions.stream()
                        .filter(question -> question.getCategory().equals(category))
                        .toList());
            }
        }
    }

    private Question question(
            String text,
            String optionA,
            String optionB,
            String optionC,
            String optionD,
            String answer,
            String category,
            String difficulty
    ) {
        Question question = new Question();
        question.setQuestionText(text);
        question.setOptionA(optionA);
        question.setOptionB(optionB);
        question.setOptionC(optionC);
        question.setOptionD(optionD);
        question.setCorrectAnswer(answer);
        question.setCategory(category);
        question.setDifficulty(difficulty);
        return question;
    }
}

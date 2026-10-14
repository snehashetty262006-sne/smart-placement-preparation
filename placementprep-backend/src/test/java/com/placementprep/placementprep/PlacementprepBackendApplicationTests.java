package com.placementprep.placementprep;

import com.jayway.jsonpath.JsonPath;
import tools.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class PlacementprepBackendApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void contextLoads() {
    }

    @Test
    @Transactional
    void aptitudePracticeListsTopicsAndChecksAnswersWithoutExposingAnswerKey() throws Exception {
        mockMvc.perform(get("/api/questions"))
                .andExpect(status().isUnauthorized());

        String email = "integration-" + UUID.randomUUID() + "@placementprep.test";
        String registration = "{\"name\":\"Integration Test\",\"email\":\""
                + email + "\",\"password\":\"test-password\"}";

        String response = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registration))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andReturn()
                .getResponse()
                .getContentAsString();
        String token = JsonPath.read(response, "$.token");

        String questionsResponse = mockMvc.perform(get("/api/questions")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andReturn()
                .getResponse()
                .getContentAsString();

        var questionNodes = objectMapper.readTree(questionsResponse);
        assertTrue(questionNodes.isArray(), "GET /api/questions should return a JSON array");
        assertFalse(questionNodes.isEmpty(), "Expected aptitude questions, but the endpoint returned none");

        List<String> categories = new ArrayList<>();
        questionNodes.forEach(question -> {
            assertTrue(question.hasNonNull("category"), "Each question should include its category");
            assertFalse(question.has("correctAnswer"), "Question listings must not expose answer keys");
            categories.add(question.get("category").asText());
        });
        assertTrue(
                categories.contains("Quantitative"),
                "Missing Quantitative questions; returned categories: " + categories
        );
        assertTrue(
                categories.contains("Logical Reasoning"),
                "Missing Logical Reasoning questions; returned categories: " + categories
        );
        assertTrue(
                categories.contains("Verbal Ability"),
                "Missing Verbal Ability questions; returned categories: " + categories
        );

        String createdQuestion = """
                {
                  "questionText": "Integration test: what is 2 + 2?",
                  "optionA": "3",
                  "optionB": "4",
                  "optionC": "5",
                  "optionD": "6",
                  "correctAnswer": "4",
                  "category": "Quantitative",
                  "difficulty": "Easy"
                }
                """;
        String createdQuestionResponse = mockMvc.perform(post("/api/questions")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createdQuestion))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correctAnswer").doesNotExist())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Long questionId = ((Number) JsonPath.read(createdQuestionResponse, "$.id")).longValue();
        mockMvc.perform(post("/api/questions/" + questionId + "/answer")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("answer", "4"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correct").value(true))
                .andExpect(jsonPath("$.correctAnswer").value("4"));

        mockMvc.perform(post("/api/questions/" + questionId + "/answer")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("answer", "3"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correct").value(false))
                .andExpect(jsonPath("$.correctAnswer").value("4"));
    }
}

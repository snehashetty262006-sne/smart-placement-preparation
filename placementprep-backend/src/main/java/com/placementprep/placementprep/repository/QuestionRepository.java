package com.placementprep.placementprep.repository;

import com.placementprep.placementprep.Entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    boolean existsByCategoryIgnoreCase(String category);
}
package com.carrentalsystem.dto.assistant;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AssistantChatRequest {

    @NotBlank(message = "question is required")
    private String question;

    /**
     * Optional internal/system data passed from client.
     * If omitted, backend will build data from DB.
     */
    private Object data;
}

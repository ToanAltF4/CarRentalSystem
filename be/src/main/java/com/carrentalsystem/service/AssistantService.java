package com.carrentalsystem.service;

import com.carrentalsystem.dto.assistant.AssistantChatRequest;
import com.carrentalsystem.dto.assistant.AssistantChatResponse;

public interface AssistantService {
    AssistantChatResponse chat(AssistantChatRequest request);
}

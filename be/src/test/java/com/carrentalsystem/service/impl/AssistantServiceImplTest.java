package com.carrentalsystem.service.impl;

import com.carrentalsystem.dto.assistant.AssistantChatRequest;
import com.carrentalsystem.dto.assistant.AssistantChatResponse;
import com.carrentalsystem.dto.vehicle.VehicleResponseDTO;
import com.carrentalsystem.entity.VehicleStatus;
import com.carrentalsystem.service.VehicleService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AssistantServiceImplTest {

    private final VehicleService vehicleService = mock(VehicleService.class);
    private AssistantServiceImpl assistantService;

    @BeforeEach
    void setUp() {
        assistantService = new AssistantServiceImpl(vehicleService, new ObjectMapper());
        ReflectionTestUtils.setField(assistantService, "feBaseUrl", "http://localhost:5173");
    }

    @Test
    void chat_filtersVehiclesByBrandMentionedInVietnameseQuestion() {
        when(vehicleService.getAllVehicles()).thenReturn(List.of(
                vehicle(1L, "Tesla", "Model 3", "Standard Range", 5, 1_250_000, VehicleStatus.AVAILABLE),
                vehicle(2L, "Kia", "EV6", "GT-Line", 5, 2_375_000, VehicleStatus.AVAILABLE),
                vehicle(3L, "Kia", "EV9", "Standard", 7, 3_500_000, VehicleStatus.AVAILABLE)
        ));

        AssistantChatRequest request = new AssistantChatRequest();
        request.setQuestion("xe hang kia");

        AssistantChatResponse response = assistantService.chat(request);

        assertThat(response.getAnswer())
                .contains("Kia EV6 GT-Line")
                .contains("Kia EV9 Standard")
                .doesNotContain("Tesla Model 3 Standard Range");
    }

    @Test
    void chat_filtersVehiclesBySpecificModelPhrase() {
        when(vehicleService.getAllVehicles()).thenReturn(List.of(
                vehicle(1L, "Tesla", "Model 3", "Standard Range", 5, 1_250_000, VehicleStatus.AVAILABLE),
                vehicle(2L, "Tesla", "Model Y", "Long Range", 5, 2_750_000, VehicleStatus.AVAILABLE),
                vehicle(3L, "Kia", "EV6", "GT-Line", 5, 2_375_000, VehicleStatus.AVAILABLE)
        ));

        AssistantChatRequest request = new AssistantChatRequest();
        request.setQuestion("tesla model 3");

        AssistantChatResponse response = assistantService.chat(request);

        assertThat(response.getAnswer())
                .contains("Tesla Model 3 Standard Range")
                .doesNotContain("Tesla Model Y Long Range")
                .doesNotContain("Kia EV6 GT-Line");
    }

    private VehicleResponseDTO vehicle(
            Long id,
            String brand,
            String name,
            String model,
            int seats,
            int dailyPrice,
            VehicleStatus status
    ) {
        return VehicleResponseDTO.builder()
                .id(id)
                .categoryBrand(brand)
                .categoryName(name)
                .categoryModel(model)
                .brand(brand)
                .name(name)
                .model(model)
                .seats(seats)
                .dailyPrice(BigDecimal.valueOf(dailyPrice))
                .dailyRate(BigDecimal.valueOf(dailyPrice))
                .status(status)
                .licensePlate("TEST-" + id)
                .build();
    }
}

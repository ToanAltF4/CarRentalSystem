package com.carrentalsystem.controller;

import com.carrentalsystem.dto.booking.DeliveryFeeResponseDTO;
import com.carrentalsystem.dto.booking.DriverFeeResponseDTO;
import com.carrentalsystem.entity.PickupMethodEntity;
import com.carrentalsystem.entity.RentalTypeEntity;
import com.carrentalsystem.repository.PickupMethodRepository;
import com.carrentalsystem.repository.RentalTypeRepository;
import com.carrentalsystem.service.PriceCalculationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for Booking Options and Fee Calculations.
 * Provides endpoints for the booking wizard to fetch options and calculate
 * fees.
 */
@RestController
@RequestMapping("/api/v1/booking-options")
@RequiredArgsConstructor
@Tag(name = "Booking Options", description = "APIs for booking wizard options and fee calculations")
public class BookingOptionsController {

    private final RentalTypeRepository rentalTypeRepository;
    private final PickupMethodRepository pickupMethodRepository;
    private final PriceCalculationService priceCalculationService;

    @GetMapping("/rental-types")
    @Operation(summary = "Get all rental types", description = "Returns SELF_DRIVE and WITH_DRIVER options")
    public ResponseEntity<List<RentalTypeEntity>> getRentalTypes() {
        List<RentalTypeEntity> rentalTypes = rentalTypeRepository.findAll();
        return ResponseEntity.ok(rentalTypes);
    }

    @GetMapping("/pickup-methods")
    @Operation(summary = "Get all pickup methods", description = "Returns STORE and DELIVERY options")
    public ResponseEntity<List<PickupMethodEntity>> getPickupMethods() {
        List<PickupMethodEntity> pickupMethods = pickupMethodRepository.findAll();
        return ResponseEntity.ok(pickupMethods);
    }

    @GetMapping("/driver-fee")
    @Operation(summary = "Calculate driver fee", description = "Calculate driver fee for WITH_DRIVER rental type")
    public ResponseEntity<DriverFeeResponseDTO> calculateDriverFee(
            @Parameter(description = "Number of rental days") @RequestParam int days,
            @Parameter(description = "Vehicle Category ID (optional)") @RequestParam(required = false) Long vehicleCategoryId) {

        DriverFeeResponseDTO response;
        if (vehicleCategoryId != null) {
            response = priceCalculationService.calculateDriverFeeByCategory(days, vehicleCategoryId);
        } else {
            response = priceCalculationService.calculateDriverFee(days);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/calculate-delivery-fee")
    @Operation(summary = "Calculate delivery fee", description = "Calculate delivery fee based on address distance")
    public ResponseEntity<DeliveryFeeResponseDTO> calculateDeliveryFee(
            @RequestBody Map<String, String> request) {
        String deliveryAddress = request.get("deliveryAddress");
        if (deliveryAddress == null || deliveryAddress.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        DeliveryFeeResponseDTO response = priceCalculationService.calculateDeliveryFee(deliveryAddress);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/pricing-info")
    @Operation(summary = "Get current pricing info", description = "Get current driver and delivery base fees")
    public ResponseEntity<Map<String, Object>> getPricingInfo() {
        Map<String, Object> pricingInfo = Map.of(
                "driverDailyFee", priceCalculationService.getDriverDailyFee(),
                "deliveryBaseFee", priceCalculationService.getDeliveryBaseFee(),
                "deliveryFreeKm", 5,
                "deliveryPerKmRate", 5000);
        return ResponseEntity.ok(pricingInfo);
    }
}

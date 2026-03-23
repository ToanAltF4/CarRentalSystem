package com.carrentalsystem.controller;

import com.carrentalsystem.dto.profile.DriverLicenseUpdateRequest;
import com.carrentalsystem.dto.profile.ProfileResponse;
import com.carrentalsystem.dto.profile.ProfileUpdateRequest;
import com.carrentalsystem.service.UserProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@Slf4j
@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@Tag(name = "User Profile", description = "Customer profile and driver license endpoints")
public class UserProfileController {

    private final UserProfileService userProfileService;

    @Operation(summary = "Get current user profile")
    @GetMapping
    public ResponseEntity<ProfileResponse> getProfile(Principal principal) {
        String email = requireEmail(principal);
        return ResponseEntity.ok(userProfileService.getProfile(email));
    }

    @Operation(summary = "Update current user profile")
    @PutMapping
    public ResponseEntity<ProfileResponse> updateProfile(
            Principal principal,
            @Valid @RequestBody ProfileUpdateRequest request) {
        String email = requireEmail(principal);
        return ResponseEntity.ok(userProfileService.updateProfile(email, request));
    }

    @Operation(summary = "Upload or update driver license")
    @PostMapping(value = "/driver-license", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProfileResponse> updateDriverLicense(
            Principal principal,
            @Valid @ModelAttribute DriverLicenseUpdateRequest request) {
        String email = requireEmail(principal);
        return ResponseEntity.ok(userProfileService.updateDriverLicense(email, request));
    }

    private String requireEmail(Principal principal) {
        if (principal == null) {
            throw new IllegalArgumentException("User not authenticated");
        }
        return principal.getName();
    }
}

package com.carrentalsystem.service.impl;

import com.carrentalsystem.dto.profile.DriverLicenseUpdateRequest;
import com.carrentalsystem.dto.profile.ProfileResponse;
import com.carrentalsystem.dto.profile.ProfileUpdateRequest;
import com.carrentalsystem.entity.LicenseStatus;
import com.carrentalsystem.entity.UserEntity;
import com.carrentalsystem.exception.ResourceNotFoundException;
import com.carrentalsystem.repository.UserRepository;
import com.carrentalsystem.service.R2Service;
import com.carrentalsystem.service.UserProfileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserProfileServiceImpl implements UserProfileService {

    private static final Set<String> LICENSE_TYPES = Set.of(
            "PET license (fixed-term)",
            "PET license (no expiry)",
            "Legacy license (paper-based)"
    );
    private final UserRepository userRepository;
    private final R2Service r2Service;

    @Override
    @Transactional(readOnly = true)
    public ProfileResponse getProfile(String email) {
        UserEntity user = getUserByEmail(email);
        return toProfileResponse(user);
    }

    @Override
    @Transactional
    public ProfileResponse updateProfile(String email, ProfileUpdateRequest request) {
        UserEntity user = getUserByEmail(email);
        user.setFullName(request.getFullName());
        user.setPhoneNumber(request.getPhoneNumber());
        UserEntity savedUser = userRepository.save(user);
        return toProfileResponse(savedUser);
    }

    @Override
    @Transactional
    public ProfileResponse updateDriverLicense(String email, DriverLicenseUpdateRequest request) {
        if (!LICENSE_TYPES.contains(request.getLicenseType())) {
            throw new IllegalArgumentException("Unsupported license type");
        }

        UserEntity user = getUserByEmail(email);
        MultipartFile frontImage = request.getFrontImage();
        if (frontImage == null || frontImage.isEmpty()) {
            throw new IllegalArgumentException("Front image is required");
        }
        String contentType = frontImage.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Front image must be an image");
        }

        if (user.getLicenseFrontImageUrl() != null) {
            r2Service.deleteFile(user.getLicenseFrontImageUrl());
        }

        String uploadedUrl;
        try {
            uploadedUrl = r2Service.uploadFile(frontImage, "licenses", "license_" + user.getId());
        } catch (Exception ex) {
            log.error("Failed to upload driver license image", ex);
            throw new IllegalArgumentException("Failed to upload driver license image");
        }
        user.setLicenseType(request.getLicenseType());
        user.setLicenseNumber(request.getLicenseNumber());
        user.setDateOfBirth(request.getDateOfBirth());
        user.setLicenseFrontImageUrl(uploadedUrl);
        user.setLicenseStatus(LicenseStatus.PENDING);

        UserEntity saved = userRepository.save(user);
        return toProfileResponse(saved);
    }

    private UserEntity getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    private ProfileResponse toProfileResponse(UserEntity user) {
        String licenseStatus = user.getLicenseStatus() != null
                ? user.getLicenseStatus().name()
                : "NONE";
        return ProfileResponse.builder()
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .accountStatus(user.getStatus())
                .licenseStatus(licenseStatus)
                .licenseType(user.getLicenseType())
                .licenseNumber(user.getLicenseNumber())
                .dateOfBirth(user.getDateOfBirth())
                .licenseFrontImageUrl(user.getLicenseFrontImageUrl())
                .build();
    }
}

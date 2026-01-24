package com.carrentalsystem.service.impl;

import com.carrentalsystem.entity.DriverLicenseEntity;
import com.carrentalsystem.entity.UserEntity;
import com.carrentalsystem.repository.DriverLicenseRepository;
import com.carrentalsystem.repository.UserRepository;
import com.carrentalsystem.service.FileUploadService;
import com.carrentalsystem.service.R2Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileUploadServiceImpl implements FileUploadService {

    private final R2Service r2Service;
    private final UserRepository userRepository;
    private final DriverLicenseRepository driverLicenseRepository;

    @Override
    @Transactional
    public String uploadAvatar(String email, MultipartFile file) throws IOException {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        validateImageFile(file);

        if (user.getAvatarUrl() != null) {
            r2Service.deleteFile(user.getAvatarUrl());
        }

        String avatarUrl = r2Service.uploadFile(file, "avatars", "avatar_" + user.getId());
        user.setAvatarUrl(avatarUrl);
        userRepository.save(user);

        log.info("Avatar uploaded for user: {}", email);
        return avatarUrl;
    }

    @Override
    @Transactional
    public String uploadLicense(String email, MultipartFile file, String licenseType, String licenseNumber, LocalDate dateOfBirth) throws IOException {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        validateImageFile(file);

        DriverLicenseEntity license = driverLicenseRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    if (licenseType == null || licenseType.isBlank()
                            || licenseNumber == null || licenseNumber.isBlank()
                            || dateOfBirth == null) {
                        throw new IllegalArgumentException("License details are required before uploading the image");
                    }
                    return DriverLicenseEntity.builder()
                            .user(user)
                            .licenseType(licenseType)
                            .licenseNumber(licenseNumber)
                            .dateOfBirth(dateOfBirth)
                            .status("PENDING")
                            .build();
                });

        if (license.getFrontImageUrl() != null && !license.getFrontImageUrl().isBlank()) {
            r2Service.deleteFile(license.getFrontImageUrl());
        }

        String licenseUrl = r2Service.uploadFile(file, "licenses", "license_" + user.getId());
        if (licenseType != null && !licenseType.isBlank()) {
            license.setLicenseType(licenseType);
        }
        if (licenseNumber != null && !licenseNumber.isBlank()) {
            license.setLicenseNumber(licenseNumber);
        }
        if (dateOfBirth != null) {
            license.setDateOfBirth(dateOfBirth);
        }

        license.setFrontImageUrl(licenseUrl);
        license.setStatus("PENDING");
        driverLicenseRepository.save(license);

        log.info("License image uploaded for user: {}", email);
        return licenseUrl;
    }

    private void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("File must be an image");
        }
    }
}

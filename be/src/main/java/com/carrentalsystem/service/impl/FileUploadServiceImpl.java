package com.carrentalsystem.service.impl;

import com.carrentalsystem.entity.LicenseStatus;
import com.carrentalsystem.entity.UserEntity;
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

        boolean hasExistingDetails = user.getLicenseType() != null
                && user.getLicenseNumber() != null
                && user.getDateOfBirth() != null;
        if (!hasExistingDetails) {
            if (licenseType == null || licenseType.isBlank()
                    || licenseNumber == null || licenseNumber.isBlank()
                    || dateOfBirth == null) {
                throw new IllegalArgumentException("License details are required before uploading the image");
            }
        }

        if (user.getLicenseFrontImageUrl() != null && !user.getLicenseFrontImageUrl().isBlank()) {
            r2Service.deleteFile(user.getLicenseFrontImageUrl());
        }

        String licenseUrl = r2Service.uploadFile(file, "licenses", "license_" + user.getId());
        if (licenseType != null && !licenseType.isBlank()) {
            user.setLicenseType(licenseType);
        }
        if (licenseNumber != null && !licenseNumber.isBlank()) {
            user.setLicenseNumber(licenseNumber);
        }
        if (dateOfBirth != null) {
            user.setDateOfBirth(dateOfBirth);
        }

        user.setLicenseFrontImageUrl(licenseUrl);
        user.setLicenseStatus(LicenseStatus.PENDING);
        userRepository.save(user);

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

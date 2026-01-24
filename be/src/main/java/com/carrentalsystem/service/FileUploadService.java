package com.carrentalsystem.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;

public interface FileUploadService {

    String uploadAvatar(String email, MultipartFile file) throws IOException;

    String uploadLicense(String email, MultipartFile file, String licenseType, String licenseNumber, LocalDate dateOfBirth) throws IOException;
}

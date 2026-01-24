package com.carrentalsystem.controller;

import com.carrentalsystem.dto.BaseResponse;
import com.carrentalsystem.service.FileUploadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.format.annotation.DateTimeFormat;

import java.io.IOException;
import java.security.Principal;
import java.time.LocalDate;

/**
 * Controller for file upload operations to Cloudflare R2.
 */
@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@Tag(name = "File Upload", description = "API endpoints for uploading files to Cloudflare R2")
public class FileUploadController {

    private final FileUploadService fileUploadService;

    /**
     * Upload user avatar image.
     */
    @Operation(summary = "Upload avatar", description = "Uploads user avatar image to Cloudflare R2")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Avatar uploaded successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid file or file is empty"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @PostMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BaseResponse<String>> uploadAvatar(
            @NotNull @RequestParam("file") MultipartFile file,
            Principal principal) throws IOException {
        
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(BaseResponse.<String>builder()
                            .message("User not authenticated")
                            .build());
        }

        String email = principal.getName();
        String avatarUrl = fileUploadService.uploadAvatar(email, file);

        return ResponseEntity.ok(BaseResponse.<String>builder()
                .message("Avatar uploaded successfully")
                .data(avatarUrl)
                .build());
    }

    /**
     * Upload driver's license image.
     */
    @Operation(summary = "Upload license", description = "Uploads driver's license image to Cloudflare R2")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "License image uploaded successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid file or file is empty"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @PostMapping(value = "/license", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BaseResponse<String>> uploadLicense(
            @NotNull @RequestParam("file") MultipartFile file,
            @RequestParam(value = "licenseType", required = false) String licenseType,
            @RequestParam(value = "licenseNumber", required = false) String licenseNumber,
            @RequestParam(value = "dateOfBirth", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateOfBirth,
            Principal principal) throws IOException {
        
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(BaseResponse.<String>builder()
                            .message("User not authenticated")
                            .build());
        }

        String email = principal.getName();
        String licenseUrl = fileUploadService.uploadLicense(email, file, licenseType, licenseNumber, dateOfBirth);

        return ResponseEntity.ok(BaseResponse.<String>builder()
                .message("License image uploaded successfully")
                .data(licenseUrl)
                .build());
    }
}

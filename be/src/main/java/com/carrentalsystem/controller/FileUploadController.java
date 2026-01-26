package com.carrentalsystem.controller;

import com.carrentalsystem.service.R2StorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

/**
 * REST Controller for File Upload operations
 * Uses Cloudflare R2 for storage
 */
@RestController
@RequestMapping("/api/v1/upload")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "File Upload", description = "File upload API using Cloudflare R2")
public class FileUploadController {

        private final R2StorageService r2StorageService;

        @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        @Operation(summary = "Upload a file", description = "Upload an image file to Cloudflare R2 storage")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "File uploaded successfully"),
                        @ApiResponse(responseCode = "400", description = "Invalid file or empty"),
                        @ApiResponse(responseCode = "500", description = "Upload failed")
        })
        public ResponseEntity<?> uploadFile(
                        @Parameter(description = "File to upload") @RequestParam("file") MultipartFile file) {

                log.info("Received file upload request: {} ({})",
                                file.getOriginalFilename(),
                                file.getSize());

                // Validate file
                if (file.isEmpty()) {
                        return ResponseEntity.badRequest()
                                        .body(Map.of("error", "File cannot be empty"));
                }

                // Validate file type (images only)
                String contentType = file.getContentType();
                if (contentType == null || !contentType.startsWith("image/")) {
                        return ResponseEntity.badRequest()
                                        .body(Map.of("error", "Only image files are allowed"));
                }

                // Validate file size (max 10MB)
                if (file.getSize() > 10 * 1024 * 1024) {
                        return ResponseEntity.badRequest()
                                        .body(Map.of("error", "File size exceeds 10MB limit"));
                }

                try {
                        String url = r2StorageService.uploadFile(file);
                        log.info("File uploaded successfully: {}", url);

                        return ResponseEntity.ok(Map.of(
                                        "url", url,
                                        "filename", file.getOriginalFilename(),
                                        "size", file.getSize()));
                } catch (Exception e) {
                        log.error("Failed to upload file: {}", e.getMessage());
                        return ResponseEntity.internalServerError()
                                        .body(Map.of("error", "Upload failed: " + e.getMessage()));
                }
        }

        @PostMapping(value = "/{folder}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        @Operation(summary = "Upload a file to specific folder", description = "Upload a file to a specific folder in R2")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "File uploaded successfully"),
                        @ApiResponse(responseCode = "400", description = "Invalid file or empty"),
                        @ApiResponse(responseCode = "500", description = "Upload failed")
        })
        public ResponseEntity<?> uploadFileToFolder(
                        @Parameter(description = "Folder name (e.g., vehicles, licenses)") @PathVariable String folder,
                        @Parameter(description = "File to upload") @RequestParam("file") MultipartFile file) {

                log.info("Received file upload request to folder {}: {} ({})",
                                folder,
                                file.getOriginalFilename(),
                                file.getSize());

                // Validate file
                if (file.isEmpty()) {
                        return ResponseEntity.badRequest()
                                        .body(Map.of("error", "File cannot be empty"));
                }

                // Validate file size (max 10MB)
                if (file.getSize() > 10 * 1024 * 1024) {
                        return ResponseEntity.badRequest()
                                        .body(Map.of("error", "File size exceeds 10MB limit"));
                }

                try {
                        String url = r2StorageService.uploadFile(file, folder);
                        log.info("File uploaded successfully to {}: {}", folder, url);

                        return ResponseEntity.ok(Map.of(
                                        "url", url,
                                        "filename", file.getOriginalFilename(),
                                        "folder", folder,
                                        "size", file.getSize()));
                } catch (Exception e) {
                        log.error("Failed to upload file: {}", e.getMessage());
                        return ResponseEntity.internalServerError()
                                        .body(Map.of("error", "Upload failed: " + e.getMessage()));
                }
        }

        @DeleteMapping
        @Operation(summary = "Delete a file", description = "Delete a file from R2 storage by URL")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "File deleted successfully"),
                        @ApiResponse(responseCode = "400", description = "Invalid URL")
        })
        public ResponseEntity<?> deleteFile(
                        @Parameter(description = "File URL to delete") @RequestParam("url") String url) {

                log.info("Received file delete request: {}", url);

                if (url == null || url.isEmpty()) {
                        return ResponseEntity.badRequest()
                                        .body(Map.of("error", "URL cannot be empty"));
                }

                try {
                        r2StorageService.deleteFile(url);
                        return ResponseEntity.ok(Map.of("message", "File deleted successfully"));
                } catch (Exception e) {
                        log.error("Failed to delete file: {}", e.getMessage());
                        return ResponseEntity.internalServerError()
                                        .body(Map.of("error", "Delete failed: " + e.getMessage()));
                }
        }
}

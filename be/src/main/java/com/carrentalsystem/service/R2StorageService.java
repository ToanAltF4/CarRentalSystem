package com.carrentalsystem.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectResponse;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.io.IOException;
import java.util.UUID;

/**
 * Cloudflare R2 Storage Service
 * Handles file uploads to R2 bucket
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class R2StorageService {

    private final S3Client s3Client;

    @Value("${app.r2.bucket}")
    private String bucketName;

    @Value("${app.r2.public-base-url}")
    private String publicBaseUrl;

    /**
     * Upload a file to R2
     * 
     * @param file MultipartFile to upload
     * @return Public URL of the uploaded file
     */
    public String uploadFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }

        try {
            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = getFileExtension(originalFilename);
            String uniqueFilename = "vehicles/" + UUID.randomUUID() + extension;

            // Determine content type
            String contentType = file.getContentType();
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            // Build put request
            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(uniqueFilename)
                    .contentType(contentType)
                    .contentLength(file.getSize())
                    .build();

            // Upload file
            PutObjectResponse response = s3Client.putObject(
                    putRequest,
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            log.info("File uploaded successfully: {} (ETag: {})", uniqueFilename, response.eTag());

            // Return public URL
            return publicBaseUrl + "/" + uniqueFilename;

        } catch (S3Exception e) {
            log.error("S3 error uploading file: {}", e.awsErrorDetails().errorMessage());
            throw new RuntimeException("Failed to upload file to R2: " + e.awsErrorDetails().errorMessage(), e);
        } catch (IOException e) {
            log.error("IO error uploading file: {}", e.getMessage());
            throw new RuntimeException("Failed to read file: " + e.getMessage(), e);
        }
    }

    /**
     * Upload file with custom folder path
     * 
     * @param file   MultipartFile to upload
     * @param folder Folder path (e.g., "vehicles", "licenses")
     * @return Public URL of the uploaded file
     */
    public String uploadFile(MultipartFile file, String folder) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }

        try {
            // Generate unique filename with folder
            String originalFilename = file.getOriginalFilename();
            String extension = getFileExtension(originalFilename);
            String uniqueFilename = folder + "/" + UUID.randomUUID() + extension;

            // Determine content type
            String contentType = file.getContentType();
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            // Build put request
            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(uniqueFilename)
                    .contentType(contentType)
                    .contentLength(file.getSize())
                    .build();

            // Upload file
            PutObjectResponse response = s3Client.putObject(
                    putRequest,
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            log.info("File uploaded to {}: {} (ETag: {})", folder, uniqueFilename, response.eTag());

            // Return public URL
            return publicBaseUrl + "/" + uniqueFilename;

        } catch (S3Exception e) {
            log.error("S3 error uploading file: {}", e.awsErrorDetails().errorMessage());
            throw new RuntimeException("Failed to upload file to R2: " + e.awsErrorDetails().errorMessage(), e);
        } catch (IOException e) {
            log.error("IO error uploading file: {}", e.getMessage());
            throw new RuntimeException("Failed to read file: " + e.getMessage(), e);
        }
    }

    /**
     * Delete a file from R2
     * 
     * @param fileUrl Public URL of the file to delete
     */
    public void deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) {
            return;
        }

        try {
            // Extract key from URL
            String key = fileUrl.replace(publicBaseUrl + "/", "");

            DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            s3Client.deleteObject(deleteRequest);
            log.info("File deleted successfully: {}", key);

        } catch (S3Exception e) {
            log.error("Failed to delete file: {}", e.awsErrorDetails().errorMessage());
            // Don't throw - deletion failure shouldn't break the flow
        }
    }

    /**
     * Get file extension from filename
     */
    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf("."));
    }
}

package com.carrentalsystem.service.impl;

import com.carrentalsystem.service.R2Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.UUID;

/**
 * Implementation of R2Service for Cloudflare R2 file operations.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@ConditionalOnBean(S3Client.class)
@Primary
public class R2ServiceImpl implements R2Service {

    private final S3Client s3Client;

    @Value("${app.r2.bucket}")
    private String bucket;

    @Value("${app.r2.public-base-url}")
    private String publicBaseUrl;

    @Override
    public String uploadFile(MultipartFile file, String folder, String fileName) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be null or empty");
        }

        // Get original file extension
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        // Generate unique file name
        String uniqueFileName = fileName + "_" + UUID.randomUUID().toString().substring(0, 8) + extension;
        String key = folder + "/" + uniqueFileName;

        // Upload to R2
        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .contentType(file.getContentType())
                .build();

        s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

        // Return public URL
        String publicUrl = publicBaseUrl + "/" + key;
        log.info("File uploaded successfully to R2: {}", publicUrl);
        
        return publicUrl;
    }

    @Override
    public boolean deleteFile(String fileUrl) {
        try {
            // Extract key from public URL
            String key = fileUrl.replace(publicBaseUrl + "/", "");
            
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .build();

            s3Client.deleteObject(deleteObjectRequest);
            log.info("File deleted successfully from R2: {}", fileUrl);
            return true;
        } catch (Exception e) {
            log.error("Error deleting file from R2: {}", fileUrl, e);
            return false;
        }
    }
}

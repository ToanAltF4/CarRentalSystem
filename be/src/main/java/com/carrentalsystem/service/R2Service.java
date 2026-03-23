package com.carrentalsystem.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * Service interface for Cloudflare R2 file upload operations.
 */
public interface R2Service {
    
    /**
     * Upload a file to R2 storage.
     * 
     * @param file The file to upload
     * @param folder The folder path in the bucket (e.g., "avatars", "licenses")
     * @param fileName The desired file name (without extension)
     * @return The public URL of the uploaded file
     * @throws IOException if file upload fails
     */
    String uploadFile(MultipartFile file, String folder, String fileName) throws IOException;
    
    /**
     * Delete a file from R2 storage.
     * 
     * @param fileUrl The public URL of the file to delete
     * @return true if deletion was successful, false otherwise
     */
    boolean deleteFile(String fileUrl);
}

package com.carrentalsystem.service.impl;

import com.carrentalsystem.service.R2Service;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Slf4j
@Service
public class NoopR2ServiceImpl implements R2Service {

    @Override
    public String uploadFile(MultipartFile file, String folder, String fileName) throws IOException {
        log.warn("R2 storage not configured. uploadFile called for folder={}, fileName={}", folder, fileName);
        throw new IllegalArgumentException("R2 storage is not configured");
    }

    @Override
    public boolean deleteFile(String fileUrl) {
        log.warn("R2 storage not configured. deleteFile called for fileUrl={}", fileUrl);
        return false;
    }
}

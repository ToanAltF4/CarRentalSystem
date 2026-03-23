package com.carrentalsystem.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;

import java.net.URI;

/**
 * Cloudflare R2 Configuration
 * R2 is S3-compatible, so we use the AWS S3 SDK
 */
@Configuration
public class R2Config {

    @Value("${app.r2.account-id}")
    private String accountId;

    @Value("${app.r2.access-key-id}")
    private String accessKeyId;

    @Value("${app.r2.secret-access-key}")
    private String secretAccessKey;

    @Value("${app.r2.endpoint}")
    private String endpoint;

    @Bean
    public S3Client s3Client() {
        // Build credentials
        AwsBasicCredentials credentials = AwsBasicCredentials.create(accessKeyId, secretAccessKey);

        // R2 requires path-style access
        S3Configuration s3Config = S3Configuration.builder()
                .pathStyleAccessEnabled(true)
                .build();

        // Build S3 client for R2
        return S3Client.builder()
                .endpointOverride(URI.create(endpoint))
                .credentialsProvider(StaticCredentialsProvider.create(credentials))
                .region(Region.US_EAST_1) // R2 doesn't use regions, but SDK requires one
                .serviceConfiguration(s3Config)
                .build();
    }
}

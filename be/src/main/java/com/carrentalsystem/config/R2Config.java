package com.carrentalsystem.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

import java.net.URI;

/**
 * Configuration for Cloudflare R2 (S3-compatible) storage.
 */
@Configuration
@ConditionalOnExpression(
        "T(org.springframework.util.StringUtils).hasText('${app.r2.access-key-id:}') && " +
        "T(org.springframework.util.StringUtils).hasText('${app.r2.secret-access-key:}') && " +
        "T(org.springframework.util.StringUtils).hasText('${app.r2.endpoint:}')"
)
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
        AwsBasicCredentials credentials = AwsBasicCredentials.create(accessKeyId, secretAccessKey);

        return S3Client.builder()
                .endpointOverride(URI.create(endpoint))
                .credentialsProvider(StaticCredentialsProvider.create(credentials))
                .region(Region.of("auto")) // R2 requires a region, but it's not used
                .build();
    }
}

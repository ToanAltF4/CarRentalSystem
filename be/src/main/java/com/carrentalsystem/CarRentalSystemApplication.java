package com.carrentalsystem;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@SpringBootApplication
public class CarRentalSystemApplication {
  public static void main(String[] args) {
    loadEnvFileIfPresent(Paths.get("env.example"));
    loadEnvFileIfPresent(Paths.get("be", "env.example"));
    SpringApplication.run(CarRentalSystemApplication.class, args);
  }

  private static void loadEnvFileIfPresent(Path path) {
    if (!Files.exists(path)) {
      return;
    }
    try {
      for (String rawLine : Files.readAllLines(path)) {
        String line = rawLine.trim();
        if (line.isEmpty() || line.startsWith("#")) {
          continue;
        }
        int idx = line.indexOf('=');
        if (idx <= 0) {
          continue;
        }
        String key = line.substring(0, idx).trim();
        String value = line.substring(idx + 1).trim();
        if (value.startsWith("\"") && value.endsWith("\"") && value.length() > 1) {
          value = value.substring(1, value.length() - 1);
        }
        if (System.getProperty(key) == null && System.getenv(key) == null) {
          System.setProperty(key, value);
        }
      }
    } catch (IOException ex) {
      // If env file cannot be read, continue without blocking startup.
      System.err.println("Failed to load env file: " + path + " (" + ex.getMessage() + ")");
    }
  }
}


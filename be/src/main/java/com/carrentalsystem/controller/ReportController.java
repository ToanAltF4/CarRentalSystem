package com.carrentalsystem.controller;

import com.carrentalsystem.dto.report.ReportOverviewDTO;
import com.carrentalsystem.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

/**
 * REST Controller for Report / Analytics operations.
 */
@RestController
@RequestMapping("/api/v1/admin/reports")
@RequiredArgsConstructor
@Tag(name = "Admin Reports", description = "Reporting & Analytics API")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/overview")
    @Operation(summary = "Get report overview",
            description = "Returns comprehensive report data: status breakdown, revenue by category, top vehicles, daily trend")
    public ResponseEntity<ReportOverviewDTO> getReportOverview(
            @Parameter(description = "Start date (yyyy-MM-dd), defaults to 30 days ago")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @Parameter(description = "End date (yyyy-MM-dd), defaults to today")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(reportService.getReportOverview(from, to));
    }
}

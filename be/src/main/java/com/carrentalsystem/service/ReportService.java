package com.carrentalsystem.service;

import com.carrentalsystem.dto.report.ReportOverviewDTO;

import java.time.LocalDate;

/**
 * Service interface for Report operations.
 */
public interface ReportService {

    /**
     * Get comprehensive report overview for the given date range.
     * Defaults to the last 30 days if no range is supplied.
     */
    ReportOverviewDTO getReportOverview(LocalDate from, LocalDate to);
}

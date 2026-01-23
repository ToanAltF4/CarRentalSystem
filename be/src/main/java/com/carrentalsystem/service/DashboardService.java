package com.carrentalsystem.service;

import com.carrentalsystem.dto.dashboard.DashboardStatsDTO;
import com.carrentalsystem.dto.dashboard.MonthlyRevenueDTO;

import java.util.List;

/**
 * Service interface for Dashboard operations.
 */
public interface DashboardService {

    /**
     * Get dashboard statistics for admin.
     */
    DashboardStatsDTO getDashboardStats();

    /**
     * Get monthly revenue for the current year.
     */
    List<MonthlyRevenueDTO> getMonthlyRevenue(Integer year);
}

import api from './api';

/**
 * Admin Dashboard Service
 * Connects to /api/v1/admin/* endpoints
 * Requires ADMIN or MANAGER role
 */
const adminService = {
    // ========== DASHBOARD STATS ==========

    /**
     * Get dashboard statistics
     * @returns {Promise<DashboardStatsDTO>} Stats including total revenue, bookings, active rentals
     */
    getDashboardStats: async () => {
        const response = await api.get('/admin/stats');
        return response.data;
    },

    // ========== REVENUE REPORTS ==========

    /**
     * Get monthly revenue for a specific year
     * @param {number} year - Year to get revenue for (defaults to current year)
     * @returns {Promise<MonthlyRevenueDTO[]>} Array of monthly revenue data
     */
    getMonthlyRevenue: async (year) => {
        const params = year ? { year } : {};
        const response = await api.get('/admin/revenue/monthly', { params });
        return response.data;
    },

    /**
     * Get revenue summary for current year
     * @returns {Promise<{labels: string[], data: number[]}>} Chart-ready data
     */
    getRevenueChartData: async (year) => {
        const data = await adminService.getMonthlyRevenue(year);
        return {
            labels: data.map(item => item.month || item.monthName),
            data: data.map(item => item.revenue || item.totalRevenue || 0)
        };
    }
};

export default adminService;

import api from './api';

/**
 * Dashboard Service
 * Connects to /api/v1/admin/* endpoints
 * Requires ADMIN role
 */
const dashboardService = {
    /**
     * Get dashboard statistics
     * @returns {Promise<DashboardStatsDTO>}
     */
    getStats: async () => {
        const response = await api.get('/v1/admin/stats');
        return response.data;
    },

    /**
     * Get monthly revenue for a specific year
     * @param {number} year - Year to get revenue for
     * @returns {Promise<MonthlyRevenueDTO[]>}
     */
    getMonthlyRevenue: async (year) => {
        const params = year ? { year } : {};
        const response = await api.get('/v1/admin/revenue/monthly', { params });
        return response.data;
    }
};

export default dashboardService;

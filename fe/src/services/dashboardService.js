import api from './api';
import { cachedGet } from './requestCache';

const DASHBOARD_CACHE_PREFIX = 'dashboard:';

/**
 * Dashboard Service
 * Connects to /api/v1/admin/* endpoints
 * Requires ADMIN role
 */
const dashboardService = {
    /**
     * Get dashboard overview in one request
     * @param {number} year - Year to get revenue for
     * @returns {Promise<{stats: DashboardStatsDTO, monthlyRevenue: MonthlyRevenueDTO[]}>}
     */
    getOverview: async (year) => {
        const params = year ? { year } : {};
        return cachedGet(
            `${DASHBOARD_CACHE_PREFIX}overview:${year || 'current'}`,
            async () => {
                const response = await api.get('/v1/admin/overview', { params });
                return response.data;
            },
            30_000
        );
    },

    /**
     * Get dashboard statistics
     * @returns {Promise<DashboardStatsDTO>}
     */
    getStats: async () => {
        return cachedGet(
            `${DASHBOARD_CACHE_PREFIX}stats`,
            async () => {
                const response = await api.get('/v1/admin/stats');
                return response.data;
            },
            30_000
        );
    },

    /**
     * Get monthly revenue for a specific year
     * @param {number} year - Year to get revenue for
     * @returns {Promise<MonthlyRevenueDTO[]>}
     */
    getMonthlyRevenue: async (year) => {
        const params = year ? { year } : {};
        return cachedGet(
            `${DASHBOARD_CACHE_PREFIX}monthly-revenue:${year || 'current'}`,
            async () => {
                const response = await api.get('/v1/admin/revenue/monthly', { params });
                return response.data;
            },
            30_000
        );
    }
};

export default dashboardService;

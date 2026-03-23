import api from './api';

/**
 * Report Service
 * Connects to /api/v1/admin/reports/* endpoints
 * Requires ADMIN role
 */
const reportService = {
    /**
     * Get report overview with optional date range
     * @param {string} from - Start date (yyyy-MM-dd)
     * @param {string} to   - End date (yyyy-MM-dd)
     * @returns {Promise<ReportOverviewDTO>}
     */
    getOverview: async (from, to) => {
        const params = {};
        if (from) params.from = from;
        if (to) params.to = to;
        const response = await api.get('/v1/admin/reports/overview', { params });
        return response.data;
    }
};

export default reportService;

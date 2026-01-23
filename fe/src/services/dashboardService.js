import api from './api';

const dashboardService = {
    // Get dashboard statistics
    getStats: async () => {
        const response = await api.get('/admin/stats');
        return response.data;
    },

    // Get monthly revenue (for charts)
    getMonthlyRevenue: async (year) => {
        const params = year ? `?year=${year}` : '';
        const response = await api.get(`/admin/revenue/monthly${params}`);
        return response.data;
    }
};

export default dashboardService;

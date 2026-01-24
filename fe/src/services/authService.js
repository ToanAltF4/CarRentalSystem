import api from './api';

/**
 * Authentication Service
 * Handles login, register, logout, refresh operations
 */
const authService = {
    /**
     * Login user with email and password
     * @param {string} email 
     * @param {string} password 
     * @returns {Promise} User data with tokens
     */
    async login(email, password) {
        const response = await api.post('/auth/login', {
            email,
            password
        });

        const { accessToken, userId, role, fullName, email: userEmail } = response.data;

        // Store access token and user info (refresh token is in HttpOnly cookie)
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('userId', userId);
        localStorage.setItem('userRole', role);
        localStorage.setItem('userName', fullName);
        localStorage.setItem('userEmail', userEmail || email);

        return response.data;
    },

    /**
     * Register new user
     * @param {Object} userData - {email, password, fullName, phoneNumber, address, licenseNumber}
     * @returns {Promise} Registration response
     */
    async register(userData) {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    /**
     * Logout current user
     * Revokes refresh token on backend and clears local storage
     */
    async logout() {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear local storage regardless of API success
            localStorage.clear();
            window.location.href = '/';
        }
    },

    /**
     * Check if user is authenticated
     * @returns {boolean}
     */
    isAuthenticated() {
        return !!localStorage.getItem('accessToken');
    },

    /**
     * Get current user info from localStorage
     * @returns {Object|null}
     */
    getCurrentUser() {
        if (!this.isAuthenticated()) {
            return null;
        }

        return {
            userId: localStorage.getItem('userId'),
            role: localStorage.getItem('userRole'),
            fullName: localStorage.getItem('userName'),
            email: localStorage.getItem('userEmail')
        };
    },

    /**
     * Get user role
     * @returns {string|null}
     */
    getUserRole() {
        return localStorage.getItem('userRole');
    }
};

export default authService;

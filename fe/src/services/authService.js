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
    },

    /**
     * Verify OTP code
     * @param {string} email 
     * @param {string} otpCode - 6-digit OTP code
     * @returns {Promise} Verification response
     */
    async verifyOtp(email, otpCode) {
        const response = await api.post('/auth/verify-otp', {
            email,
            otpCode
        });
        return response.data;
    },

    /**
     * Resend OTP code
     * @param {string} email 
     * @returns {Promise} Resend response
     */
    async resendOtp(email) {
        const response = await api.post('/auth/resend-otp', {
            email
        });
        return response.data;
    },

    /**
     * Request password reset
     * @param {string} email 
     * @returns {Promise} Password reset request response
     */
    async forgotPassword(email) {
        const response = await api.post('/auth/forgot-password', {
            email
        });
        return response.data;
    },

    /**
     * Reset password with token
     * @param {string} token - Reset token from email
     * @param {string} newPassword - New password
     * @returns {Promise} Password reset response
     */
    async resetPassword(token, newPassword) {
        const response = await api.post('/auth/reset-password', {
            token,
            newPassword
        });
        return response.data;
    }
};

export default authService;

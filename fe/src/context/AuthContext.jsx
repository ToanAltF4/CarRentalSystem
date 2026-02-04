import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import profileService from '../services/profileService';

// Create Auth Context
const AuthContext = createContext(null);

/**
 * AuthProvider - Provides authentication state and methods to the app
 */
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Check localStorage on app load to persist login
    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                setUser(userData);
                setIsAuthenticated(true);
            } catch (error) {
                console.error('Failed to parse stored user:', error);
                // Clear invalid data
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    /**
     * Login user with email and password
     * @param {string} email 
     * @param {string} password 
     * @returns {Promise<Object>} User data
     */
    const login = async (email, password) => {
        const response = await api.post('/auth/login', { email, password });

        const { token, accessToken, user: userData, userId, role, fullName, email: userEmail, licenseStatus } = response.data;

        // Handle both response formats (token or accessToken)
        const authToken = token || accessToken;

        // Build user object from response
        const userInfo = userData || {
            id: userId,
            email: userEmail || email,
            role: role,
            fullName: fullName,
            licenseStatus: licenseStatus || 'NONE'
        };

        // Save to localStorage
        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(userInfo));

        // Update state
        setUser(userInfo);
        setIsAuthenticated(true);

        return userInfo;
    };

    /**
     * Register new user
     * @param {Object} userData - Registration data
     * @returns {Promise<Object>} Registration response
     */
    const register = async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    };

    /**
     * Logout current user
     */
    const logout = async () => {
        try {
            // Call logout endpoint if available
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout API error:', error);
        } finally {
            // Clear localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            // Reset state
            setUser(null);
            setIsAuthenticated(false);

            // Redirect to home
            window.location.href = '/';
        }
    };

    /**
     * Refresh user data from backend (e.g., after license status update)
     * @returns {Promise<Object|null>} Updated user data
     */
    const refreshUser = async () => {
        if (!isAuthenticated) return null;

        try {
            const profileData = await profileService.getProfile();

            // Update user with new data from profile
            const updatedUser = {
                ...user,
                licenseStatus: profileData.licenseStatus || 'NONE',
                fullName: profileData.fullName || user.fullName,
                email: profileData.email || user.email
            };

            // Update localStorage and state
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);

            return updatedUser;
        } catch (error) {
            console.error('Failed to refresh user data:', error);
            return null;
        }
    };

    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        refreshUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * useAuth - Custom hook to access auth context
 * @returns {Object} Auth context value
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;

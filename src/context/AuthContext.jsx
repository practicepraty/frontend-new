import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const clearError = () => setError(null);

    const checkAuthStatus = async () => {
        try {
            const response = await apiService.getCurrentUser();
            if (response.success && response.data.user) {
                setUser(response.data.user);
                setIsAuthenticated(true);
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
        } catch (error) {
            setUser(null);
            setIsAuthenticated(false);
            console.error('Auth check failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const login = async (credentials) => {
        try {
            setIsLoading(true);
            setError(null);
            
            const response = await apiService.login(credentials);
            
            if (response.success && response.data.user) {
                setUser(response.data.user);
                setIsAuthenticated(true);
                return { success: true, message: 'Login successful!' };
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error) {
            const errorMessage = apiService.getErrorMessage(error);
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (userData) => {
        try {
            setIsLoading(true);
            setError(null);
            
            const response = await apiService.register(userData);
            
            if (response.success) {
                return { 
                    success: true, 
                    message: 'Registration successful! Please sign in with your credentials.' 
                };
            } else {
                throw new Error('Registration failed');
            }
        } catch (error) {
            const errorMessage = apiService.getErrorMessage(error);
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            setIsLoading(true);
            await apiService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setIsAuthenticated(false);
            setIsLoading(false);
            setError(null);
        }
    };

    const forgotPassword = async (email) => {
        try {
            setIsLoading(true);
            setError(null);
            
            const response = await apiService.forgotPassword(email);
            
            if (response.success) {
                return { 
                    success: true, 
                    message: 'Password reset instructions have been sent to your email.' 
                };
            } else {
                throw new Error('Failed to send reset email');
            }
        } catch (error) {
            const errorMessage = apiService.getErrorMessage(error);
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    const resetPassword = async (resetData) => {
        try {
            setIsLoading(true);
            setError(null);
            
            const response = await apiService.resetPassword(resetData);
            
            if (response.success) {
                return { 
                    success: true, 
                    message: 'Password reset successful! Please sign in with your new password.' 
                };
            } else {
                throw new Error('Password reset failed');
            }
        } catch (error) {
            const errorMessage = apiService.getErrorMessage(error);
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    const updateProfile = async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            await checkAuthStatus();
            
            return { 
                success: true, 
                message: 'Profile updated successfully!' 
            };
        } catch (error) {
            const errorMessage = apiService.getErrorMessage(error);
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    const getUserDisplayName = () => {
        if (!user) return 'Guest';
        
        if (user.personalInfo) {
            const { title, firstName, lastName } = user.personalInfo;
            return `${title || ''} ${firstName || ''} ${lastName || ''}`.trim();
        }
        
        return user.fullName || user.email || 'User';
    };

    const getUserEmail = () => {
        if (!user) return null;
        return user.personalInfo?.professionalEmail || user.email;
    };

    const getUserSpecialty = () => {
        if (!user) return null;
        return user.professionalInfo?.specialty || null;
    };

    const value = {
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        updateProfile,
        clearError,
        getUserDisplayName,
        getUserEmail,
        getUserSpecialty,
        checkAuthStatus
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
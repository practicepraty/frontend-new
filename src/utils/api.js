const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class ApiService {
    constructor() {
        this.csrfToken = null;
        this.baseURL = API_BASE_URL;
    }

    async fetchCSRFToken() {
        try {
            const response = await fetch(`${this.baseURL}/api/v1/csrf-token`, {
                method: 'GET',
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                this.csrfToken = data.data.csrfToken;
                return this.csrfToken;
            }
        } catch (error) {
            console.error('Failed to fetch CSRF token:', error);
        }
        return null;
    }

    async makeRequest(endpoint, options = {}) {
        const { method = 'GET', body, headers = {}, isFormData = false } = options;
        
        if (!this.csrfToken && method !== 'GET') {
            await this.fetchCSRFToken();
        }

        const requestHeaders = {
            ...headers,
            ...(this.csrfToken && { 'X-CSRF-Token': this.csrfToken }),
            ...(body && !isFormData && { 'Content-Type': 'application/json' })
        };

        const requestOptions = {
            method,
            headers: requestHeaders,
            credentials: 'include',
            ...(body && { body: isFormData ? body : JSON.stringify(body) })
        };

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, requestOptions);
            const data = await response.json();

            if (!response.ok) {
                const error = new Error(data.message || 'Request failed');
                error.status = response.status;
                error.data = data;
                throw error;
            }

            return data;
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Network error. Please check your internet connection and try again.');
            }
            throw error;
        }
    }

    async login(credentials) {
        return this.makeRequest('/api/v1/users/login', {
            method: 'POST',
            body: credentials
        });
    }

    async register(userData) {
        return this.makeRequest('/api/v1/users/register', {
            method: 'POST',
            body: userData,
            isFormData: true
        });
    }

    async logout() {
        return this.makeRequest('/api/v1/users/logout', {
            method: 'POST'
        });
    }

    async getCurrentUser() {
        return this.makeRequest('/api/v1/users/current-user');
    }

    async forgotPassword(email) {
        return this.makeRequest('/api/v1/users/forgot-password', {
            method: 'POST',
            body: { email }
        });
    }

    async resetPassword(resetData) {
        return this.makeRequest('/api/v1/users/reset-password', {
            method: 'POST',
            body: resetData
        });
    }

    async refreshToken() {
        return this.makeRequest('/api/v1/users/refresh-token', {
            method: 'POST'
        });
    }

    getErrorMessage(error) {
        if (error.data?.message) {
            return error.data.message;
        }
        
        if (error.status === 401) {
            return 'Invalid credentials. Please check your email and password.';
        }
        
        if (error.status === 403) {
            return 'Access denied. Please ensure your account is verified.';
        }
        
        if (error.status === 404) {
            return 'Account not found. Please check your email address.';
        }
        
        if (error.status === 409) {
            return 'An account with this email already exists.';
        }
        
        if (error.status === 422) {
            return 'Please check your input and try again.';
        }
        
        if (error.status >= 500) {
            return 'Server error. Please try again later.';
        }
        
        return error.message || 'An unexpected error occurred. Please try again.';
    }
}

export default new ApiService();
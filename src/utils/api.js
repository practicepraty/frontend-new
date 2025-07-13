const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8005';

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
        const { method = 'GET', body, headers = {}, isFormData = false, retries = 0 } = options;
        
        if (!this.csrfToken && method !== 'GET') {
            await this.fetchCSRFToken();
        }

        const requestHeaders = {
            ...headers,
            ...(this.csrfToken && { 'X-CSRF-Token': this.csrfToken }),
            // Don't set Content-Type for FormData - let browser set it with boundary
            ...(body && !isFormData && { 'Content-Type': 'application/json' })
        };

        const requestOptions = {
            method,
            headers: requestHeaders,
            credentials: 'include',
            ...(body && { body: isFormData ? body : JSON.stringify(body) })
        };
        
        // Enhanced logging for debugging audio uploads
        if (isFormData && body instanceof FormData) {
            console.log('Making FormData request to:', `${this.baseURL}${endpoint}`);
            console.log('FormData entries:');
            for (let [key, value] of body.entries()) {
                if (value instanceof File) {
                    console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
                } else {
                    console.log(`  ${key}: ${value}`);
                }
            }
            console.log('Request headers:', requestHeaders);
        }

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, requestOptions);
            
            let data = null;
            const contentType = response.headers.get('content-type');
            
            try {
                if (contentType && contentType.includes('application/json')) {
                    data = await response.json();
                } else {
                    const text = await response.text();
                    data = { message: text || 'Unknown response' };
                }
            } catch (parseError) {
                console.warn('Failed to parse response:', parseError);
                data = { message: 'Invalid response format', status: response.status };
            }

            if (!response.ok) {
                const error = new Error(data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`);
                error.status = response.status;
                error.data = data;
                
                // Enhanced error logging for audio uploads
                if (isFormData && body instanceof FormData) {
                    console.error('Audio upload failed:', {
                        status: response.status,
                        statusText: response.statusText,
                        responseData: data,
                        endpoint: `${this.baseURL}${endpoint}`
                    });
                }
                
                // Add retry logic for certain status codes (but not for client errors like 400)
                if (retries < 3 && (response.status >= 500 || response.status === 429)) {
                    console.warn(`Request failed with status ${response.status}, retrying... (${retries + 1}/3)`);
                    await this.delay(Math.pow(2, retries) * 1000); // Exponential backoff
                    return this.makeRequest(endpoint, { ...options, retries: retries + 1 });
                }
                
                throw error;
            }

            return data;
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                const networkError = new Error('Network error. Please check your internet connection and try again.');
                networkError.status = 0;
                networkError.data = { message: 'Network connection failed', retryable: true };
                
                // Retry network errors
                if (retries < 2) {
                    console.warn(`Network error, retrying... (${retries + 1}/2)`);
                    await this.delay(2000);
                    return this.makeRequest(endpoint, { ...options, retries: retries + 1 });
                }
                
                throw networkError;
            }
            throw error;
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
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
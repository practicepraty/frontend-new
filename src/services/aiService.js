import apiService from '../utils/api.js';
import websocketService from './websocketService.js';
import regenerationService from './regenerationService.js';

class AIService {
    constructor() {
        this.processingSteps = {
            audio: [
                { id: 'upload', label: 'Uploading audio file...', estimatedTime: 5 },
                { id: 'transcribe', label: 'Transcribing audio with Assembly AI...', estimatedTime: 30 },
                { id: 'process_text', label: 'Processing transcription...', estimatedTime: 10 },
                { id: 'detect_specialty', label: 'Detecting medical specialty...', estimatedTime: 15 },
                { id: 'generate_content', label: 'Generating content...', estimatedTime: 25 },
                { id: 'build_structure', label: 'Building website structure...', estimatedTime: 20 }
            ],
            text: [
                { id: 'process_text', label: 'Processing your text...', estimatedTime: 10 },
                { id: 'detect_specialty', label: 'Detecting medical specialty...', estimatedTime: 15 },
                { id: 'generate_content', label: 'Generating content...', estimatedTime: 25 },
                { id: 'build_structure', label: 'Building website structure...', estimatedTime: 20 }
            ]
        };
    }

    getProcessingSteps(inputType) {
        return this.processingSteps[inputType] || [];
    }

    getTotalEstimatedTime(inputType) {
        return this.getProcessingSteps(inputType).reduce((total, step) => total + step.estimatedTime, 0);
    }

    async processAudioInput(audioFile, onProgress) {
        try {
            // Validate audio file before upload
            const validation = this.validateAudioFile(audioFile);
            if (!validation.isValid) {
                throw new Error(`Audio validation failed: ${validation.errors.join(', ')}`);
            }

            const formData = new FormData();
            formData.append('audioFile', audioFile);
            
            console.log('Uploading audio file:', {
                name: audioFile.name,
                size: audioFile.size,
                type: audioFile.type
            });

            const result = await apiService.makeRequest('/api/v1/processing/process-audio', {
                method: 'POST',
                body: formData,
                isFormData: true
            });

            const requestId = result.data.requestId;

            return await this.monitorProcessingWithWebSocket(requestId, onProgress, 'audio');

        } catch (error) {
            throw this.handleError(error);
        }
    }

    async processTextInput(textInput, onProgress) {
        try {
            const result = await apiService.makeRequest('/api/v1/processing/process-text', {
                method: 'POST',
                body: { text: textInput }
            });

            const requestId = result.data.requestId;

            return await this.monitorProcessingWithWebSocket(requestId, onProgress, 'text');

        } catch (error) {
            throw this.handleError(error);
        }
    }

    async monitorProcessingWithWebSocket(requestId, onProgress, inputType) {
        return new Promise((resolve, reject) => {
            const steps = this.getProcessingSteps(inputType);
            let currentStepIndex = 0;
            let hasCompleted = false;

            // Ensure we have valid steps
            if (!steps || steps.length === 0) {
                console.warn(`No processing steps found for inputType: ${inputType}`);
                reject(new Error('Invalid processing configuration'));
                return;
            }

            const updateProgress = (stepId, status = 'processing', progress = 0, error = null) => {
                if (onProgress && !hasCompleted) {
                    // Find the correct step index based on stepId
                    const stepIndex = stepId ? steps.findIndex(step => step.id === stepId) : currentStepIndex;
                    const actualStepIndex = stepIndex >= 0 ? stepIndex : currentStepIndex;
                    
                    onProgress({
                        currentStep: actualStepIndex,
                        totalSteps: steps.length,
                        stepId: stepId || steps[actualStepIndex]?.id || '',
                        stepLabel: steps[actualStepIndex]?.label || 'Processing...',
                        status,
                        progress,
                        error,
                        inputType
                    });
                }
            };

            const cleanup = () => {
                websocketService.off('progress', handleProgress);
                websocketService.off('status', handleStatus);
                websocketService.off('complete', handleComplete);
                websocketService.off('error', handleError);
                websocketService.disconnect();
            };

            const handleProgress = (data) => {
                if (data && data.requestId === requestId) {
                    const stepIndex = data.step ? steps.findIndex(step => step.id === data.step) : -1;
                    if (stepIndex >= 0) {
                        currentStepIndex = stepIndex;
                        updateProgress(data.step, 'processing', data.progress || 0);
                    } else {
                        // If step not found, use current step
                        updateProgress(steps[currentStepIndex]?.id, 'processing', data.progress || 0);
                    }
                }
            };

            const handleStatus = (data) => {
                if (data && data.requestId === requestId) {
                    const stepIndex = data.step ? steps.findIndex(step => step.id === data.step) : -1;
                    if (stepIndex >= 0) {
                        currentStepIndex = stepIndex;
                        if (data.status === 'completed') {
                            updateProgress(data.step, 'completed', 100);
                            if (currentStepIndex < steps.length - 1) {
                                currentStepIndex++;
                            }
                        } else {
                            updateProgress(data.step, data.status, data.progress || 0);
                        }
                    } else {
                        // If step not found, use current step
                        updateProgress(steps[currentStepIndex]?.id, data.status || 'processing', data.progress || 0);
                    }
                }
            };

            const handleComplete = (data) => {
                if (data.requestId === requestId && !hasCompleted) {
                    hasCompleted = true;
                    cleanup();
                    resolve({
                        success: true,
                        data: data.result
                    });
                }
            };

            const handleError = (data) => {
                if (data.requestId === requestId && !hasCompleted) {
                    hasCompleted = true;
                    cleanup();
                    reject(this.handleError(new Error(data.message || 'Processing failed')));
                }
            };

            // Send initial progress update
            updateProgress(steps[0]?.id, 'processing', 0);

            websocketService.on('progress', handleProgress);
            websocketService.on('status', handleStatus);
            websocketService.on('complete', handleComplete);
            websocketService.on('error', handleError);

            websocketService.connect(requestId).catch(error => {
                console.warn('WebSocket connection failed, falling back to polling:', error);
                cleanup();
                this.monitorProcessingWithPolling(requestId, onProgress, inputType)
                    .then(resolve)
                    .catch(reject);
            });

            setTimeout(() => {
                if (!hasCompleted) {
                    hasCompleted = true;
                    cleanup();
                    reject(new Error('Processing timeout'));
                }
            }, 300000); // 5 minute timeout
        });
    }

    async monitorProcessingWithPolling(requestId, onProgress, inputType) {
        const steps = this.getProcessingSteps(inputType);
        let currentStepIndex = 0;
        const maxAttempts = 60; // 5 minutes
        let attempts = 0;

        // Ensure we have valid steps
        if (!steps || steps.length === 0) {
            throw new Error('Invalid processing configuration');
        }

        const updateProgress = (stepId, status = 'processing', progress = 0, error = null) => {
            if (onProgress) {
                // Find the correct step index based on stepId
                const stepIndex = stepId ? steps.findIndex(step => step.id === stepId) : currentStepIndex;
                const actualStepIndex = stepIndex >= 0 ? stepIndex : currentStepIndex;
                
                onProgress({
                    currentStep: actualStepIndex,
                    totalSteps: steps.length,
                    stepId: stepId || steps[actualStepIndex]?.id || '',
                    stepLabel: steps[actualStepIndex]?.label || 'Processing...',
                    status,
                    progress,
                    error,
                    inputType
                });
            }
        };

        // Send initial progress update
        updateProgress(steps[0]?.id, 'processing', 0);

        return new Promise((resolve, reject) => {
            const pollInterval = setInterval(async () => {
                try {
                    attempts++;
                    const status = await apiService.makeRequest(`/api/v1/processing/status/${requestId}`);
                    
                    if (status.data.status === 'completed') {
                        clearInterval(pollInterval);
                        resolve({
                            success: true,
                            data: status.data.result
                        });
                    } else if (status.data.status === 'error' || status.data.status === 'failed') {
                        clearInterval(pollInterval);
                        reject(new Error(status.data.error || 'Processing failed'));
                    } else if (status.data.status === 'processing') {
                        if (status.data.currentStep) {
                            const stepIndex = steps.findIndex(step => step.id === status.data.currentStep);
                            if (stepIndex >= 0) {
                                currentStepIndex = stepIndex;
                                updateProgress(status.data.currentStep, 'processing', status.data.progress || 0);
                            } else {
                                // If step not found in backend data, estimate progress
                                const estimatedProgress = Math.min(95, (attempts / maxAttempts) * 100);
                                updateProgress(steps[currentStepIndex]?.id, 'processing', estimatedProgress);
                            }
                        } else {
                            // No specific step info, estimate progress
                            const estimatedProgress = Math.min(95, (attempts / maxAttempts) * 100);
                            updateProgress(steps[currentStepIndex]?.id, 'processing', estimatedProgress);
                        }
                    }
                    
                    if (attempts >= maxAttempts) {
                        clearInterval(pollInterval);
                        reject(new Error('Processing timeout'));
                    }
                } catch (error) {
                    clearInterval(pollInterval);
                    reject(error);
                }
            }, 5000); // Poll every 5 seconds
        });
    }

    async cancelProcessing(requestId) {
        try {
            if (websocketService.isConnected()) {
                websocketService.cancelProcessing(requestId);
            }
            
            await apiService.makeRequest(`/api/v1/processing/cancel/${requestId}`, {
                method: 'POST'
            });
            
            return { success: true };
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getJobStatus(requestId) {
        try {
            const result = await apiService.makeRequest(`/api/v1/processing/status/${requestId}`);
            return result.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getAllJobs() {
        try {
            const result = await apiService.makeRequest('/api/v1/processing/jobs');
            return result.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async checkHealthStatus() {
        try {
            const result = await apiService.makeRequest('/api/v1/processing/health');
            return result.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    parseBackendError(error) {
        // Extract detailed error information from backend response
        let errorDetails = {
            type: 'unknown',
            stage: 'unknown',
            message: error.message || 'Unknown error occurred',
            originalMessage: error.message,
            code: null,
            details: null,
            retryable: true
        };

        // Parse error data from backend response
        if (error.data) {
            console.log('Backend error response:', error.data);
            
            // Extract error type and stage from backend
            errorDetails.type = error.data.type || error.data.errorType || 'processing';
            errorDetails.stage = error.data.stage || error.data.step || 'unknown';
            errorDetails.code = error.data.code || error.data.errorCode;
            errorDetails.details = error.data.details || error.data.error_details;
            errorDetails.retryable = error.data.retryable !== undefined ? error.data.retryable : true;
            
            // Use backend message if available
            if (error.data.message || error.data.error) {
                errorDetails.originalMessage = error.data.message || error.data.error;
            }
        }

        // Categorize error based on status code
        if (error.status) {
            if (error.status >= 400 && error.status < 500) {
                errorDetails.type = 'client';
                errorDetails.retryable = false;
            } else if (error.status >= 500) {
                errorDetails.type = 'server';
                errorDetails.retryable = true;
            }
        }

        return errorDetails;
    }

    categorizeError(errorDetails) {
        // Categorize errors by stage and type for better user messaging
        const { type, stage, code, originalMessage } = errorDetails;
        
        // Upload stage errors
        if (stage === 'upload' || type === 'upload') {
            return {
                category: 'upload',
                severity: 'error',
                userMessage: 'File upload failed. Please check your internet connection and try again.',
                technicalMessage: originalMessage,
                retryable: true,
                guidance: 'Try uploading the file again. If the problem persists, check your internet connection.'
            };
        }
        
        // Audio transcription errors
        if (stage === 'transcribe' || originalMessage.toLowerCase().includes('transcrib')) {
            return {
                category: 'transcription',
                severity: 'error',
                userMessage: 'Audio transcription failed. The audio quality may be too low or the file may be corrupted.',
                technicalMessage: originalMessage,
                retryable: true,
                guidance: 'Try recording again with better audio quality, or upload a different audio file.'
            };
        }
        
        // Processing errors
        if (stage === 'process_text' || stage === 'detect_specialty' || stage === 'generate_content') {
            return {
                category: 'processing',
                severity: 'error',
                userMessage: 'AI processing failed. This may be due to insufficient information in your audio or a temporary service issue.',
                technicalMessage: originalMessage,
                retryable: true,
                guidance: 'Try providing more detailed information about your medical practice, or try again in a few minutes.'
            };
        }
        
        // Network errors
        if (type === 'network' || originalMessage.toLowerCase().includes('network')) {
            return {
                category: 'network',
                severity: 'warning',
                userMessage: 'Network connection issue. Please check your internet connection.',
                technicalMessage: originalMessage,
                retryable: true,
                guidance: 'Check your internet connection and try again.'
            };
        }
        
        // Server errors
        if (type === 'server' || code >= 500) {
            return {
                category: 'server',
                severity: 'error',
                userMessage: 'Server error. Our service is temporarily experiencing issues.',
                technicalMessage: originalMessage,
                retryable: true,
                guidance: 'Please try again in a few minutes. If the problem persists, contact support.'
            };
        }
        
        // Client errors
        if (type === 'client' || (code >= 400 && code < 500)) {
            if (code === 400) {
                return {
                    category: 'validation',
                    severity: 'error',
                    userMessage: 'Invalid request. The audio file or request format may not be correct.',
                    technicalMessage: originalMessage,
                    retryable: false,
                    guidance: 'Try recording a new audio file or upload a different file format.'
                };
            }
            if (code === 413) {
                return {
                    category: 'file_size',
                    severity: 'error',
                    userMessage: 'File is too large. Please use a smaller audio file.',
                    technicalMessage: originalMessage,
                    retryable: false,
                    guidance: 'Record a shorter audio clip or compress your audio file.'
                };
            }
            if (code === 415) {
                return {
                    category: 'file_format',
                    severity: 'error',
                    userMessage: 'Unsupported file format. Please use MP3, WAV, M4A, WebM, or OGG format.',
                    technicalMessage: originalMessage,
                    retryable: false,
                    guidance: 'Try recording again or convert your file to a supported format.'
                };
            }
        }
        
        // Default fallback
        return {
            category: 'unknown',
            severity: 'error',
            userMessage: 'An unexpected error occurred during processing.',
            technicalMessage: originalMessage,
            retryable: true,
            guidance: 'Please try again. If the problem persists, contact support.'
        };
    }

    handleError(error) {
        // Parse backend error details
        const errorDetails = this.parseBackendError(error);
        
        // Categorize error for user-friendly messaging
        const categorizedError = this.categorizeError(errorDetails);
        
        console.log('Error analysis:', {
            original: error,
            parsed: errorDetails,
            categorized: categorizedError
        });

        return {
            message: categorizedError.userMessage,
            technicalMessage: categorizedError.technicalMessage,
            category: categorizedError.category,
            severity: categorizedError.severity,
            retryable: categorizedError.retryable,
            guidance: categorizedError.guidance,
            originalError: errorDetails.originalMessage,
            timestamp: new Date().toISOString(),
            code: errorDetails.code,
            status: error.status,
            stage: errorDetails.stage,
            type: errorDetails.type
        };
    }

    // Utility methods for file validation
    validateAudioFile(file) {
        const maxSize = 100 * 1024 * 1024; // 100MB
        const minSize = 1000; // 1KB minimum
        // Include common browser recording formats
        const allowedTypes = [
            'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/mpeg', 'audio/mp4',
            'audio/webm', 'audio/ogg', 'audio/webm;codecs=opus', 'audio/ogg;codecs=opus'
        ];
        
        const errors = [];
        
        if (!file) {
            errors.push('No audio file provided');
            return { isValid: false, errors };
        }
        
        if (file.size === 0) {
            errors.push('Audio file is empty');
        } else if (file.size < minSize) {
            errors.push('Audio file is too small (likely contains no audio)');
        } else if (file.size > maxSize) {
            errors.push('File size must be under 100MB');
        }
        
        // More flexible audio type validation
        const isValidType = allowedTypes.some(type => {
            return file.type === type || file.type.includes(type.split(';')[0]);
        });
        
        if (!isValidType) {
            errors.push(`Invalid audio format: ${file.type}. Supported formats: MP3, WAV, M4A, WebM, OGG`);
        }
        
        console.log('Audio file validation:', {
            name: file.name,
            size: file.size,
            type: file.type,
            isValid: errors.length === 0,
            errors
        });
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    validateTextInput(text) {
        const minLength = 50;
        const maxLength = 10000;
        
        const errors = [];
        
        if (!text || text.trim().length < minLength) {
            errors.push(`Text must be at least ${minLength} characters long`);
        }
        
        if (text && text.length > maxLength) {
            errors.push(`Text must be under ${maxLength} characters`);
        }
        
        // Check for medical-related keywords
        const medicalKeywords = ['doctor', 'medical', 'practice', 'patient', 'clinic', 'hospital', 'specialty', 'treatment'];
        const hasMedialContent = medicalKeywords.some(keyword => 
            text.toLowerCase().includes(keyword)
        );
        
        if (!hasMedialContent) {
            errors.push('Please include information about your medical practice');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Content regeneration methods
    async regenerateContent(sectionId, currentContent, prompt, options = {}) {
        return await regenerationService.regenerateContent(sectionId, currentContent, prompt, options);
    }

    async improveContent(content, improvementType, options = {}) {
        return await regenerationService.improveContent(content, improvementType, options);
    }

    async generateVariations(content, count = 3, options = {}) {
        return await regenerationService.generateVariations(content, count, options);
    }

    async analyzeContent(content, options = {}) {
        return await regenerationService.analyzeContent(content, options);
    }

    async optimizeForSpecialty(content, specialty, options = {}) {
        return await regenerationService.optimizeForSpecialty(content, specialty, options);
    }

    async generateSectionContent(sectionType, practiceInfo, options = {}) {
        return await regenerationService.generateSectionContent(sectionType, practiceInfo, options);
    }

    getContentSuggestions(sectionType, specialty = 'general') {
        return regenerationService.getContentSuggestions(sectionType, specialty);
    }
}

export default new AIService();
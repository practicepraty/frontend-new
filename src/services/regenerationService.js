import apiService from '../utils/api.js';

/**
 * Regeneration Service - Handles AI content regeneration requests
 */
class RegenerationService {
    constructor() {
        this.cache = new Map();
        this.regenerationHistory = [];
    }

    /**
     * Regenerate content using AI
     * @param {string} sectionId - Section identifier
     * @param {string} currentContent - Current content to improve
     * @param {string} prompt - Regeneration prompt
     * @param {Object} options - Additional options
     * @returns {Promise} Regeneration result
     */
    async regenerateContent(sectionId, currentContent, prompt, options = {}) {
        try {
            // Build request payload
            const payload = {
                sectionId,
                currentContent,
                prompt,
                options: {
                    tone: options.tone || 'professional',
                    audience: options.audience || 'patients',
                    length: options.length || 'same',
                    keywords: options.keywords || '',
                    variation: options.variation || 1,
                    medicalContext: true,
                    preserveAccuracy: true,
                    ...options
                }
            };

            // Check cache first
            const cacheKey = this.generateCacheKey(payload);
            const cached = this.cache.get(cacheKey);
            if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
                return cached.result;
            }

            let result;
            
            // Use website-specific API if websiteId is provided
            if (options.websiteId) {
                result = await apiService.regenerateContent(options.websiteId, sectionId, {
                    prompt,
                    tone: options.tone,
                    audience: options.audience,
                    length: options.length,
                    keywords: options.keywords,
                    currentContent,
                    variation: options.variation
                });
            } else {
                // Fallback to general regeneration API
                result = await apiService.makeRequest('/api/v1/content/regenerate', {
                    method: 'POST',
                    body: payload
                });
            }

            // Process and validate result
            const processedResult = this.processRegenerationResult(result);
            
            // Cache the result
            this.cache.set(cacheKey, {
                result: processedResult,
                timestamp: Date.now()
            });

            // Add to history
            this.addToHistory({
                sectionId,
                originalContent: currentContent,
                prompt,
                result: processedResult,
                timestamp: new Date().toISOString()
            });

            return processedResult;

        } catch (error) {
            console.error('Content regeneration failed:', error);
            throw this.handleRegenerationError(error);
        }
    }

    /**
     * Generate cache key for request
     * @param {Object} payload - Request payload
     * @returns {string} Cache key
     */
    generateCacheKey(payload) {
        const keyData = {
            content: payload.currentContent,
            prompt: payload.prompt,
            tone: payload.options.tone,
            audience: payload.options.audience,
            length: payload.options.length,
            keywords: payload.options.keywords
        };
        
        return btoa(JSON.stringify(keyData));
    }

    /**
     * Process regeneration result
     * @param {Object} result - Raw API result
     * @returns {Object} Processed result
     */
    processRegenerationResult(result) {
        if (!result || !result.data) {
            throw new Error('Invalid regeneration result received');
        }

        const { data } = result;
        
        return {
            success: true,
            data: {
                content: data.content || '',
                score: data.score || 0.8,
                improvements: data.improvements || [],
                metrics: {
                    readabilityScore: data.metrics?.readabilityScore || 0,
                    seoScore: data.metrics?.seoScore || 0,
                    engagementScore: data.metrics?.engagementScore || 0,
                    medicalAccuracy: data.metrics?.medicalAccuracy || 0
                },
                suggestions: data.suggestions || []
            }
        };
    }

    /**
     * Handle regeneration errors
     * @param {Error} error - Original error
     * @returns {Error} Processed error
     */
    handleRegenerationError(error) {
        if (error.response?.status === 429) {
            return new Error('Rate limit exceeded. Please wait before regenerating more content.');
        }
        
        if (error.response?.status === 400) {
            return new Error('Invalid content or prompt provided. Please check your input.');
        }
        
        if (error.response?.status === 500) {
            return new Error('AI service temporarily unavailable. Please try again later.');
        }
        
        return new Error(error.message || 'Failed to regenerate content. Please try again.');
    }

    /**
     * Improve content with specific focus
     * @param {string} content - Content to improve
     * @param {string} improvementType - Type of improvement
     * @param {Object} options - Additional options
     * @returns {Promise} Improvement result
     */
    async improveContent(content, improvementType, options = {}) {
        const improvementPrompts = {
            clarity: 'Improve the clarity and readability of this content while maintaining all key information.',
            engagement: 'Make this content more engaging and compelling for readers while keeping it professional.',
            seo: 'Optimize this content for search engines by improving keyword usage and structure.',
            medical: 'Enhance the medical accuracy and professional tone of this content.',
            accessibility: 'Make this content more accessible and easier to understand for all readers.',
            length: 'Adjust the length of this content to be more appropriate for web readers.',
            tone: 'Adjust the tone of this content to be more suitable for medical practice communication.'
        };

        const prompt = improvementPrompts[improvementType] || improvementPrompts.clarity;
        
        return this.regenerateContent(null, content, prompt, {
            ...options,
            improvementType
        });
    }

    /**
     * Generate multiple content variations
     * @param {string} content - Base content
     * @param {number} count - Number of variations
     * @param {Object} options - Generation options
     * @returns {Promise} Array of variations
     */
    async generateVariations(content, count = 3, options = {}) {
        const variations = [];
        
        for (let i = 0; i < count; i++) {
            try {
                const variation = await this.regenerateContent(
                    null,
                    content,
                    'Create a variation of this content that maintains the same meaning but uses different wording and structure.',
                    {
                        ...options,
                        variation: i + 1
                    }
                );
                variations.push(variation);
            } catch (error) {
                console.error(`Failed to generate variation ${i + 1}:`, error);
                // Continue with other variations
            }
        }
        
        return variations;
    }

    /**
     * Optimize content for specific medical specialty
     * @param {string} content - Content to optimize
     * @param {string} specialty - Medical specialty
     * @param {Object} options - Additional options
     * @returns {Promise} Optimization result
     */
    async optimizeForSpecialty(content, specialty, options = {}) {
        const specialtyPrompts = {
            cardiology: 'Optimize this content for a cardiology practice, emphasizing heart health expertise and cardiac care services.',
            dermatology: 'Optimize this content for a dermatology practice, focusing on skin health and dermatological expertise.',
            orthopedics: 'Optimize this content for an orthopedic practice, highlighting bone, joint, and musculoskeletal expertise.',
            pediatrics: 'Optimize this content for a pediatric practice, emphasizing child healthcare and family-friendly communication.',
            psychiatry: 'Optimize this content for a psychiatry practice, focusing on mental health expertise and compassionate care.',
            neurology: 'Optimize this content for a neurology practice, emphasizing brain and nervous system expertise.',
            gastroenterology: 'Optimize this content for a gastroenterology practice, focusing on digestive health expertise.',
            general: 'Optimize this content for a general medical practice, emphasizing comprehensive healthcare services.'
        };

        const prompt = specialtyPrompts[specialty] || specialtyPrompts.general;
        
        return this.regenerateContent(null, content, prompt, {
            ...options,
            specialty,
            medicalSpecialty: specialty
        });
    }

    /**
     * Generate content for specific website sections
     * @param {string} sectionType - Type of section
     * @param {Object} practiceInfo - Practice information
     * @param {Object} options - Generation options
     * @returns {Promise} Generated content
     */
    async generateSectionContent(sectionType, practiceInfo, options = {}) {
        const sectionPrompts = {
            hero: 'Generate compelling hero section content that introduces the medical practice and encourages patient engagement.',
            about: 'Generate professional about section content that establishes credibility and builds trust with potential patients.',
            services: 'Generate clear and informative services section content that explains medical services and treatments offered.',
            contact: 'Generate welcoming contact section content that makes it easy for patients to reach out and schedule appointments.',
            footer: 'Generate professional footer content with essential links and practice information.'
        };

        const prompt = sectionPrompts[sectionType] || sectionPrompts.about;
        
        return this.regenerateContent(sectionType, '', prompt, {
            ...options,
            sectionType,
            practiceInfo,
            generateNew: true
        });
    }

    /**
     * Analyze content quality and provide recommendations
     * @param {string} content - Content to analyze
     * @param {Object} options - Analysis options
     * @returns {Promise} Analysis result
     */
    async analyzeContent(content, options = {}) {
        try {
            const result = await apiService.makeRequest('/api/v1/content/analyze', {
                method: 'POST',
                body: {
                    content,
                    options: {
                        includeReadability: true,
                        includeSEO: true,
                        includeMedicalAccuracy: true,
                        includeEngagement: true,
                        ...options
                    }
                }
            });

            return {
                success: true,
                data: {
                    scores: result.data.scores || {},
                    suggestions: result.data.suggestions || [],
                    keywords: result.data.keywords || [],
                    readabilityLevel: result.data.readabilityLevel || 'Unknown',
                    improvements: result.data.improvements || []
                }
            };

        } catch (error) {
            console.error('Content analysis failed:', error);
            throw new Error('Failed to analyze content. Please try again.');
        }
    }

    /**
     * Get regeneration history
     * @returns {Array} History of regenerations
     */
    getHistory() {
        return [...this.regenerationHistory];
    }

    /**
     * Add regeneration to history
     * @param {Object} regeneration - Regeneration record
     */
    addToHistory(regeneration) {
        this.regenerationHistory.unshift(regeneration);
        
        // Keep only last 100 regenerations
        if (this.regenerationHistory.length > 100) {
            this.regenerationHistory = this.regenerationHistory.slice(0, 100);
        }
    }

    /**
     * Clear regeneration history
     */
    clearHistory() {
        this.regenerationHistory = [];
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Get content suggestions based on best practices
     * @param {string} sectionType - Section type
     * @param {string} specialty - Medical specialty
     * @returns {Array} Content suggestions
     */
    getContentSuggestions(sectionType, specialty = 'general') {
        const suggestions = {
            hero: [
                'Include your practice name and specialty prominently',
                'Add a clear call-to-action for appointment scheduling',
                'Mention your key credentials or experience',
                'Use patient-friendly language that builds trust',
                'Include location information if relevant'
            ],
            about: [
                'Highlight your medical education and certifications',
                'Mention years of experience and areas of expertise',
                'Include your approach to patient care',
                'Add any specializations or unique services',
                'Use professional but approachable tone'
            ],
            services: [
                'List services in order of importance or popularity',
                'Include brief descriptions of each service',
                'Mention any specialized equipment or techniques',
                'Add information about insurance acceptance',
                'Include preventive care options'
            ],
            contact: [
                'Provide multiple contact methods (phone, email, online)',
                'Include office hours and location details',
                'Add emergency contact information if applicable',
                'Mention parking and accessibility information',
                'Include a map or directions'
            ]
        };

        return suggestions[sectionType] || [];
    }
}

export default new RegenerationService();
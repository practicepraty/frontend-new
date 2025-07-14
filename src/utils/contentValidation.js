/**
 * Content validation utilities for medical practice websites
 */

// Medical content validation rules
export const validationRules = {
    // Text content rules
    title: {
        required: true,
        minLength: 10,
        maxLength: 60,
        pattern: /^[a-zA-Z0-9\s\-\.,!]+$/,
        seoRecommended: { min: 30, max: 60 }
    },
    
    subtitle: {
        required: false,
        minLength: 20,
        maxLength: 160,
        pattern: /^[a-zA-Z0-9\s\-\.,!?]+$/,
        seoRecommended: { min: 120, max: 160 }
    },
    
    description: {
        required: true,
        minLength: 50,
        maxLength: 2000,
        pattern: /^[a-zA-Z0-9\s\-\.,!?()'"]+$/
    },
    
    shortDescription: {
        required: false,
        minLength: 20,
        maxLength: 300,
        pattern: /^[a-zA-Z0-9\s\-\.,!?()'"]+$/
    },
    
    // Contact information rules
    email: {
        required: false,
        pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        message: 'Please enter a valid email address'
    },
    
    phone: {
        required: false,
        pattern: /^[\+]?[\d\s\-\(\)\.]{10,}$/,
        message: 'Please enter a valid phone number'
    },
    
    address: {
        required: false,
        minLength: 10,
        maxLength: 200,
        pattern: /^[a-zA-Z0-9\s\-\.,#]+$/
    },
    
    // Button and CTA rules
    button: {
        required: true,
        minLength: 3,
        maxLength: 30,
        pattern: /^[a-zA-Z0-9\s\-]+$/
    },
    
    // List item rules
    listItem: {
        required: true,
        minLength: 2,
        maxLength: 100,
        pattern: /^[a-zA-Z0-9\s\-\.,&]+$/
    },
    
    // URL rules
    url: {
        required: false,
        pattern: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
        message: 'Please enter a valid URL'
    }
};

// Medical specialty keywords for content validation
export const medicalKeywords = {
    general: ['medical', 'healthcare', 'doctor', 'physician', 'clinic', 'practice', 'patient', 'treatment', 'care', 'health'],
    cardiology: ['heart', 'cardiac', 'cardiology', 'cardiovascular', 'ECG', 'EKG', 'blood pressure', 'chest pain', 'heart attack'],
    dermatology: ['skin', 'dermatology', 'acne', 'moles', 'rash', 'eczema', 'psoriasis', 'skincare', 'cosmetic'],
    orthopedics: ['bone', 'joint', 'orthopedic', 'fracture', 'spine', 'knee', 'shoulder', 'hip', 'sports medicine'],
    pediatrics: ['children', 'pediatric', 'kids', 'infant', 'adolescent', 'vaccination', 'development', 'family'],
    psychiatry: ['mental health', 'psychology', 'therapy', 'counseling', 'depression', 'anxiety', 'psychiatric'],
    neurology: ['brain', 'neurological', 'nervous system', 'seizure', 'stroke', 'migraine', 'memory', 'neurologist'],
    gastroenterology: ['digestive', 'stomach', 'intestinal', 'GI', 'endoscopy', 'colonoscopy', 'liver', 'gallbladder']
};

// Content quality assessment criteria
export const qualityMetrics = {
    readability: {
        averageWordsPerSentence: { min: 8, max: 20, optimal: 15 },
        averageSyllablesPerWord: { min: 1.3, max: 1.7, optimal: 1.5 },
        passiveVoicePercentage: { max: 20 },
        fleschReadingScore: { min: 60, optimal: 70 }
    },
    
    seo: {
        keywordDensity: { min: 0.5, max: 3, optimal: 1.5 },
        titleLength: { min: 30, max: 60 },
        metaDescriptionLength: { min: 120, max: 160 },
        headingStructure: { h1: 1, h2: { min: 2, max: 6 }, h3: { max: 10 } }
    },
    
    medical: {
        credibilityIndicators: ['certified', 'board-certified', 'licensed', 'experienced', 'qualified', 'trained'],
        trustSignals: ['HIPAA', 'confidential', 'secure', 'privacy', 'accredited', 'insurance'],
        callToAction: ['schedule', 'appointment', 'consult', 'contact', 'call', 'book']
    }
};

/**
 * Validate a single field based on its type and rules
 * @param {string} fieldType - Type of field (title, email, etc.)
 * @param {*} value - Value to validate
 * @param {Object} customRules - Custom validation rules
 * @returns {Object} Validation result
 */
export function validateField(fieldType, value, customRules = {}) {
    const rules = { ...validationRules[fieldType], ...customRules };
    const errors = [];
    const warnings = [];
    
    if (!rules) {
        return { isValid: true, errors, warnings };
    }
    
    // Check if field is required
    if (rules.required && (!value || value.toString().trim() === '')) {
        errors.push('This field is required');
        return { isValid: false, errors, warnings };
    }
    
    // Skip further validation if field is empty and not required
    if (!value || value.toString().trim() === '') {
        return { isValid: true, errors, warnings };
    }
    
    const stringValue = value.toString().trim();
    
    // Check length constraints
    if (rules.minLength && stringValue.length < rules.minLength) {
        errors.push(`Minimum length is ${rules.minLength} characters`);
    }
    
    if (rules.maxLength && stringValue.length > rules.maxLength) {
        errors.push(`Maximum length is ${rules.maxLength} characters`);
    }
    
    // Check pattern matching
    if (rules.pattern && !rules.pattern.test(stringValue)) {
        errors.push(rules.message || 'Invalid format');
    }
    
    // SEO recommendations
    if (rules.seoRecommended) {
        if (stringValue.length < rules.seoRecommended.min) {
            warnings.push(`For better SEO, consider using ${rules.seoRecommended.min}-${rules.seoRecommended.max} characters`);
        }
        if (stringValue.length > rules.seoRecommended.max) {
            warnings.push(`For better SEO, consider keeping under ${rules.seoRecommended.max} characters`);
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Validate content for medical appropriateness
 * @param {string} content - Content to validate
 * @param {string} specialty - Medical specialty
 * @returns {Object} Validation result
 */
export function validateMedicalContent(content, specialty = 'general') {
    const errors = [];
    const warnings = [];
    const suggestions = [];
    
    if (!content || content.trim() === '') {
        return { isValid: true, errors, warnings, suggestions };
    }
    
    const lowerContent = content.toLowerCase();
    const specialtyKeywords = medicalKeywords[specialty] || medicalKeywords.general;
    
    // Check for medical context
    const hasMedicalContext = specialtyKeywords.some(keyword => 
        lowerContent.includes(keyword.toLowerCase())
    );
    
    if (!hasMedicalContext) {
        warnings.push('Content may benefit from more medical terminology relevant to your specialty');
    }
    
    // Check for credibility indicators
    const hasCredibilityIndicators = qualityMetrics.medical.credibilityIndicators.some(indicator =>
        lowerContent.includes(indicator.toLowerCase())
    );
    
    if (!hasCredibilityIndicators) {
        suggestions.push('Consider adding credibility indicators like "board-certified" or "licensed"');
    }
    
    // Check for trust signals
    const hasTrustSignals = qualityMetrics.medical.trustSignals.some(signal =>
        lowerContent.includes(signal.toLowerCase())
    );
    
    if (!hasTrustSignals) {
        suggestions.push('Consider mentioning trust signals like "HIPAA compliant" or "secure"');
    }
    
    // Check for call to action
    const hasCallToAction = qualityMetrics.medical.callToAction.some(cta =>
        lowerContent.includes(cta.toLowerCase())
    );
    
    if (!hasCallToAction) {
        suggestions.push('Consider adding a call to action like "Schedule an appointment"');
    }
    
    // Check for potential issues
    const problematicPhrases = [
        'guaranteed cure',
        'miracle treatment',
        'instant results',
        'no side effects',
        'best doctor',
        'cheapest'
    ];
    
    problematicPhrases.forEach(phrase => {
        if (lowerContent.includes(phrase)) {
            errors.push(`Avoid using potentially misleading phrase: "${phrase}"`);
        }
    });
    
    return {
        isValid: errors.length === 0,
        errors,
        warnings,
        suggestions
    };
}

/**
 * Validate content structure for completeness
 * @param {Object} contentData - Complete content structure
 * @returns {Object} Validation result
 */
export function validateContentStructure(contentData) {
    const errors = [];
    const warnings = [];
    const suggestions = [];
    
    if (!contentData || typeof contentData !== 'object') {
        errors.push('Invalid content structure');
        return { isValid: false, errors, warnings, suggestions };
    }
    
    // Check essential sections
    const essentialSections = ['hero', 'about', 'services', 'contact'];
    const pages = contentData.pages?.home || {};
    
    essentialSections.forEach(section => {
        if (!pages[section]) {
            errors.push(`Missing essential section: ${section}`);
        }
    });
    
    // Check hero section
    if (pages.hero) {
        if (!pages.hero.title?.text) {
            errors.push('Hero section must have a title');
        }
        if (!pages.hero.cta?.text) {
            warnings.push('Hero section should have a call-to-action button');
        }
    }
    
    // Check about section
    if (pages.about) {
        if (!pages.about.content?.text) {
            errors.push('About section must have content');
        }
        if (pages.about.content?.text && pages.about.content.text.length < 100) {
            warnings.push('About section content should be more detailed');
        }
    }
    
    // Check services section
    if (pages.services) {
        if (!pages.services.items || pages.services.items.length === 0) {
            warnings.push('Services section should list at least one service');
        } else {
            pages.services.items.forEach((service, index) => {
                if (!service.name?.text) {
                    errors.push(`Service ${index + 1} must have a name`);
                }
                if (!service.description?.text) {
                    warnings.push(`Service ${index + 1} should have a description`);
                }
            });
        }
    }
    
    // Check contact section
    if (pages.contact) {
        const hasContact = pages.contact.phone?.text || pages.contact.email?.text;
        if (!hasContact) {
            errors.push('Contact section must have at least phone or email');
        }
        
        if (!pages.contact.address?.text) {
            suggestions.push('Consider adding practice address for better local SEO');
        }
    }
    
    // Check metadata
    if (contentData.metadata) {
        if (!contentData.metadata.title?.text) {
            errors.push('Page title is required for SEO');
        }
        if (!contentData.metadata.description?.text) {
            errors.push('Meta description is required for SEO');
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors,
        warnings,
        suggestions
    };
}

/**
 * Assess content quality metrics
 * @param {string} content - Content to assess
 * @returns {Object} Quality assessment
 */
export function assessContentQuality(content) {
    if (!content || content.trim() === '') {
        return {
            readabilityScore: 0,
            seoScore: 0,
            medicalScore: 0,
            overallScore: 0,
            metrics: {},
            suggestions: []
        };
    }
    
    const suggestions = [];
    const metrics = {};
    
    // Basic text analysis
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = content.split(/\s+/).filter(w => w.trim().length > 0);
    const syllables = estimateSyllables(content);
    
    metrics.sentenceCount = sentences.length;
    metrics.wordCount = words.length;
    metrics.syllableCount = syllables;
    metrics.averageWordsPerSentence = words.length / sentences.length;
    metrics.averageSyllablesPerWord = syllables / words.length;
    
    // Readability assessment
    let readabilityScore = 100;
    
    if (metrics.averageWordsPerSentence > 20) {
        readabilityScore -= 20;
        suggestions.push('Consider shorter sentences for better readability');
    }
    
    if (metrics.averageSyllablesPerWord > 1.7) {
        readabilityScore -= 15;
        suggestions.push('Consider using simpler words where appropriate');
    }
    
    // SEO assessment
    let seoScore = 100;
    
    if (words.length < 100) {
        seoScore -= 30;
        suggestions.push('Content should be at least 100 words for better SEO');
    }
    
    if (words.length > 1000) {
        seoScore -= 10;
        suggestions.push('Very long content may need better structure with headings');
    }
    
    // Medical content assessment
    let medicalScore = 100;
    
    const medicalTerms = Object.values(medicalKeywords).flat();
    const medicalTermCount = medicalTerms.filter(term => 
        content.toLowerCase().includes(term.toLowerCase())
    ).length;
    
    if (medicalTermCount === 0) {
        medicalScore -= 50;
        suggestions.push('Add relevant medical terminology');
    }
    
    // Overall score
    const overallScore = Math.round((readabilityScore + seoScore + medicalScore) / 3);
    
    return {
        readabilityScore: Math.max(0, Math.round(readabilityScore)),
        seoScore: Math.max(0, Math.round(seoScore)),
        medicalScore: Math.max(0, Math.round(medicalScore)),
        overallScore: Math.max(0, overallScore),
        metrics,
        suggestions
    };
}

/**
 * Estimate syllable count in text
 * @param {string} text - Text to analyze
 * @returns {number} Estimated syllable count
 */
function estimateSyllables(text) {
    const words = text.toLowerCase().split(/\s+/).filter(w => w.trim().length > 0);
    
    return words.reduce((total, word) => {
        // Remove punctuation
        const cleanWord = word.replace(/[^a-z]/g, '');
        
        // Count vowel groups
        const vowelGroups = cleanWord.match(/[aeiouy]+/g) || [];
        let syllables = vowelGroups.length;
        
        // Adjust for silent e
        if (cleanWord.endsWith('e')) {
            syllables--;
        }
        
        // Minimum of 1 syllable per word
        return total + Math.max(1, syllables);
    }, 0);
}

/**
 * Generate content improvement suggestions
 * @param {Object} contentData - Content to analyze
 * @param {string} specialty - Medical specialty
 * @returns {Array} Array of suggestions
 */
export function generateContentSuggestions(contentData, specialty = 'general') {
    const suggestions = [];
    
    if (!contentData || !contentData.pages?.home) {
        return suggestions;
    }
    
    const pages = contentData.pages.home;
    
    // Hero section suggestions
    if (pages.hero) {
        const heroTitle = pages.hero.title?.text || '';
        if (heroTitle.length < 30) {
            suggestions.push({
                section: 'hero',
                type: 'improvement',
                message: 'Hero title could be more descriptive',
                suggestion: 'Include your specialty and location for better impact'
            });
        }
    }
    
    // About section suggestions
    if (pages.about) {
        const aboutContent = pages.about.content?.text || '';
        if (aboutContent.length < 200) {
            suggestions.push({
                section: 'about',
                type: 'expansion',
                message: 'About section could be more detailed',
                suggestion: 'Add information about your experience, education, and approach to patient care'
            });
        }
    }
    
    // Services section suggestions
    if (pages.services && pages.services.items) {
        if (pages.services.items.length < 3) {
            suggestions.push({
                section: 'services',
                type: 'expansion',
                message: 'Consider adding more services',
                suggestion: 'List all the services you offer to improve SEO and patient understanding'
            });
        }
    }
    
    // Contact section suggestions
    if (pages.contact) {
        const hasHours = pages.contact.hours?.text;
        if (!hasHours) {
            suggestions.push({
                section: 'contact',
                type: 'addition',
                message: 'Add office hours',
                suggestion: 'Include your office hours to help patients plan their visits'
            });
        }
    }
    
    return suggestions;
}

/**
 * Validate all content in a structured format
 * @param {Object} contentData - Complete content structure
 * @param {string} specialty - Medical specialty
 * @returns {Object} Complete validation result
 */
export function validateAllContent(contentData, specialty = 'general') {
    const results = {
        isValid: true,
        errors: {},
        warnings: [],
        suggestions: [],
        quality: {
            overall: 0,
            readability: 0,
            seo: 0,
            medical: 0
        }
    };
    
    // Validate structure
    const structureValidation = validateContentStructure(contentData);
    if (!structureValidation.isValid) {
        results.isValid = false;
        results.errors.structure = structureValidation.errors;
    }
    results.warnings.push(...structureValidation.warnings);
    results.suggestions.push(...structureValidation.suggestions);
    
    // Validate individual fields
    if (contentData.pages?.home) {
        const pages = contentData.pages.home;
        
        // Validate each section
        Object.keys(pages).forEach(sectionKey => {
            const section = pages[sectionKey];
            if (section && typeof section === 'object') {
                Object.keys(section).forEach(fieldKey => {
                    const field = section[fieldKey];
                    if (field && field.editable && field.text) {
                        const fieldValidation = validateField(field.type || 'description', field.text);
                        if (!fieldValidation.isValid) {
                            results.isValid = false;
                            const errorKey = `${sectionKey}.${fieldKey}`;
                            results.errors[errorKey] = fieldValidation.errors;
                        }
                    }
                });
            }
        });
    }
    
    // Assess overall quality
    const allContent = extractAllTextContent(contentData);
    const qualityAssessment = assessContentQuality(allContent);
    results.quality = {
        overall: qualityAssessment.overallScore,
        readability: qualityAssessment.readabilityScore,
        seo: qualityAssessment.seoScore,
        medical: qualityAssessment.medicalScore
    };
    
    // Generate suggestions
    const contentSuggestions = generateContentSuggestions(contentData, specialty);
    results.suggestions.push(...contentSuggestions);
    
    return results;
}

/**
 * Extract all text content from structured data
 * @param {Object} contentData - Content structure
 * @returns {string} Combined text content
 */
function extractAllTextContent(contentData) {
    const textParts = [];
    
    if (contentData.pages?.home) {
        const pages = contentData.pages.home;
        
        Object.values(pages).forEach(section => {
            if (section && typeof section === 'object') {
                Object.values(section).forEach(field => {
                    if (field && field.text) {
                        textParts.push(field.text);
                    } else if (field && field.items && Array.isArray(field.items)) {
                        field.items.forEach(item => {
                            if (typeof item === 'object' && item.text) {
                                textParts.push(item.text);
                            }
                        });
                    }
                });
            }
        });
    }
    
    return textParts.join(' ');
}
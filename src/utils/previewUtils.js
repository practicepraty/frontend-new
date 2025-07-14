/**
 * Preview utility functions for website preview system
 */

/**
 * Responsive breakpoints for preview modes
 */
export const PREVIEW_BREAKPOINTS = {
    desktop: { min: 1200, max: null, label: 'Desktop' },
    tablet: { min: 768, max: 1199, label: 'Tablet' },
    mobile: { min: 320, max: 767, label: 'Mobile' }
};

/**
 * Available zoom levels for preview
 */
export const ZOOM_LEVELS = [50, 75, 100, 125, 150];

/**
 * Available sections for highlighting
 */
export const HIGHLIGHT_SECTIONS = [
    { id: 'header', label: 'Header' },
    { id: 'hero', label: 'Hero' },
    { id: 'about', label: 'About' },
    { id: 'services', label: 'Services' },
    { id: 'contact', label: 'Contact' },
    { id: 'footer', label: 'Footer' }
];

/**
 * Get preview dimensions based on device type
 * @param {string} deviceType - Device type (desktop, tablet, mobile)
 * @returns {Object} Width and height configuration
 */
export const getPreviewDimensions = (deviceType) => {
    const configs = {
        desktop: { width: '100%', maxWidth: '1200px', height: '600px' },
        tablet: { width: '768px', maxWidth: '768px', height: '600px' },
        mobile: { width: '375px', maxWidth: '375px', height: '600px' }
    };
    
    return configs[deviceType] || configs.desktop;
};

/**
 * Calculate zoom scale and container dimensions
 * @param {number} zoomLevel - Zoom level percentage
 * @param {string} deviceType - Device type
 * @returns {Object} Transform scale and container dimensions
 */
export const calculateZoomTransform = (zoomLevel, deviceType) => {
    const scale = zoomLevel / 100;
    const dimensions = getPreviewDimensions(deviceType);
    
    return {
        scale,
        transform: `scale(${scale})`,
        transformOrigin: 'top center',
        width: dimensions.width,
        maxWidth: dimensions.maxWidth,
        height: dimensions.height
    };
};

/**
 * Validate website data structure for preview
 * @param {Object} websiteData - Website data to validate
 * @returns {Object} Validation result
 */
export const validateWebsiteData = (websiteData) => {
    const errors = [];
    const warnings = [];
    
    if (!websiteData) {
        errors.push('No website data provided');
        return { isValid: false, errors, warnings };
    }
    
    // Check for essential structure
    if (!websiteData.content && !websiteData.html) {
        errors.push('Website data must contain either content structure or HTML');
    }
    
    // Check content structure if present
    if (websiteData.content) {
        const requiredSections = ['header', 'hero', 'about', 'services', 'contact', 'footer'];
        const missingSections = requiredSections.filter(section => 
            !websiteData.content[section] || Object.keys(websiteData.content[section]).length === 0
        );
        
        if (missingSections.length > 0) {
            warnings.push(`Missing or empty sections: ${missingSections.join(', ')}`);
        }
    }
    
    // Check styling configuration
    if (websiteData.styling) {
        if (!websiteData.styling.primaryColor) {
            warnings.push('No primary color specified in styling');
        }
        if (!websiteData.styling.fontFamily) {
            warnings.push('No font family specified in styling');
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
};

/**
 * Format processing result for preview display
 * @param {Object} processingResult - Result from AI processing
 * @returns {Object} Formatted website data
 */
export const formatProcessingResultForPreview = (processingResult) => {
    if (!processingResult || !processingResult.data) {
        return null;
    }
    
    const data = processingResult.data;
    
    // Check if data is already in website format
    if (data.content || data.html) {
        return data;
    }
    
    // Handle different response formats
    if (data.website) {
        return data.website;
    }
    
    if (data.result && data.result.website) {
        return data.result.website;
    }
    
    // Try to construct from available data
    return {
        id: data.id || data.websiteId || `preview_${Date.now()}`,
        specialty: data.specialty || 'general-practice',
        template: data.template || 'medical-modern',
        content: data.content || extractContentFromData(data),
        styling: data.styling || getDefaultStyling(),
        html: data.html || data.generatedHtml || null,
        css: data.css || data.generatedCss || null,
        metadata: {
            generatedAt: new Date().toISOString(),
            inputType: processingResult.inputType || 'unknown',
            version: '1.0'
        }
    };
};

/**
 * Extract content structure from various data formats
 * @param {Object} data - Processing result data
 * @returns {Object} Content structure
 */
const extractContentFromData = (data) => {
    return {
        header: {
            title: data.practiceTitle || data.title || 'Medical Practice',
            subtitle: data.subtitle || null,
            navigation: ['Home', 'About', 'Services', 'Contact']
        },
        hero: {
            title: data.heroTitle || data.title || 'Welcome to Our Practice',
            subtitle: data.heroSubtitle || data.description || null,
            cta: 'Schedule Appointment'
        },
        about: {
            title: 'About Our Practice',
            content: data.aboutContent || data.description || 'Learn more about our medical practice and expertise.'
        },
        services: data.services || [],
        contact: {
            title: 'Contact Information',
            address: data.address || null,
            phone: data.phone || null,
            email: data.email || null
        },
        footer: {
            copyright: `© ${new Date().getFullYear()} Medical Practice. All rights reserved.`,
            links: ['Privacy Policy', 'Terms of Service']
        }
    };
};

/**
 * Get default styling configuration
 * @returns {Object} Default styling
 */
const getDefaultStyling = () => ({
    primaryColor: '#2563eb',
    secondaryColor: '#16a34a',
    accentColor: '#f59e0b',
    fontFamily: 'Inter, sans-serif',
    theme: 'modern',
    layout: 'standard'
});

/**
 * Generate CSS media queries for responsive preview
 * @param {string} deviceType - Device type
 * @returns {string} CSS media query
 */
export const generateMediaQuery = (deviceType) => {
    const breakpoint = PREVIEW_BREAKPOINTS[deviceType];
    if (!breakpoint) return '';
    
    if (breakpoint.min && breakpoint.max) {
        return `@media (min-width: ${breakpoint.min}px) and (max-width: ${breakpoint.max}px)`;
    } else if (breakpoint.min) {
        return `@media (min-width: ${breakpoint.min}px)`;
    } else if (breakpoint.max) {
        return `@media (max-width: ${breakpoint.max}px)`;
    }
    
    return '';
};

/**
 * Check if device type is valid
 * @param {string} deviceType - Device type to check
 * @returns {boolean} True if valid
 */
export const isValidDeviceType = (deviceType) => {
    return Object.keys(PREVIEW_BREAKPOINTS).includes(deviceType);
};

/**
 * Check if zoom level is valid
 * @param {number} zoomLevel - Zoom level to check
 * @returns {boolean} True if valid
 */
export const isValidZoomLevel = (zoomLevel) => {
    return ZOOM_LEVELS.includes(zoomLevel);
};

/**
 * Check if section ID is valid for highlighting
 * @param {string} sectionId - Section ID to check
 * @returns {boolean} True if valid
 */
export const isValidSectionId = (sectionId) => {
    return HIGHLIGHT_SECTIONS.some(section => section.id === sectionId);
};

/**
 * Get next zoom level
 * @param {number} currentZoom - Current zoom level
 * @returns {number} Next zoom level or current if at max
 */
export const getNextZoomLevel = (currentZoom) => {
    const currentIndex = ZOOM_LEVELS.indexOf(currentZoom);
    return currentIndex < ZOOM_LEVELS.length - 1 ? ZOOM_LEVELS[currentIndex + 1] : currentZoom;
};

/**
 * Get previous zoom level
 * @param {number} currentZoom - Current zoom level
 * @returns {number} Previous zoom level or current if at min
 */
export const getPreviousZoomLevel = (currentZoom) => {
    const currentIndex = ZOOM_LEVELS.indexOf(currentZoom);
    return currentIndex > 0 ? ZOOM_LEVELS[currentIndex - 1] : currentZoom;
};

/**
 * Debounce function for preview updates
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

/**
 * Throttle function for preview interactions
 * @param {Function} func - Function to throttle
 * @param {number} limit - Throttle limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit) => {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

/**
 * Generate unique ID for preview instances
 * @returns {string} Unique ID
 */
export const generatePreviewId = () => {
    return `preview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Log preview event for debugging
 * @param {string} event - Event name
 * @param {Object} data - Event data
 */
export const logPreviewEvent = (event, data) => {
    if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') {
        console.log(`[Preview] ${event}:`, data);
    } else if (typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost') {
        console.log(`[Preview] ${event}:`, data);
    }
};
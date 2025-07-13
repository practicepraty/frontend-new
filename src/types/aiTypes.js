/**
 * AI Processing Types and Interfaces
 * 
 * This file contains type definitions for the AI processing system
 * including audio processing, text processing, and progress tracking.
 */

// Input types
export const INPUT_TYPES = {
    AUDIO: 'audio',
    TEXT: 'text'
};

// Processing status types
export const PROCESSING_STATUS = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    ERROR: 'error'
};

// Processing step IDs
export const PROCESSING_STEPS = {
    UPLOAD: 'upload',
    TRANSCRIBE: 'transcribe',
    PROCESS_TEXT: 'process_text',
    DETECT_SPECIALTY: 'detect_specialty',
    GENERATE_CONTENT: 'generate_content',
    BUILD_STRUCTURE: 'build_structure'
};

// Medical specialties
export const MEDICAL_SPECIALTIES = {
    CARDIOLOGY: 'cardiology',
    DERMATOLOGY: 'dermatology',
    ORTHOPEDICS: 'orthopedics',
    PEDIATRICS: 'pediatrics',
    NEUROLOGY: 'neurology',
    ONCOLOGY: 'oncology',
    PSYCHIATRY: 'psychiatry',
    FAMILY_MEDICINE: 'family_medicine',
    INTERNAL_MEDICINE: 'internal_medicine',
    EMERGENCY_MEDICINE: 'emergency_medicine',
    RADIOLOGY: 'radiology',
    ANESTHESIOLOGY: 'anesthesiology',
    SURGERY: 'surgery',
    OBSTETRICS_GYNECOLOGY: 'obstetrics_gynecology',
    OPHTHALMOLOGY: 'ophthalmology',
    ENT: 'ent',
    UROLOGY: 'urology',
    PATHOLOGY: 'pathology',
    GENERAL_PRACTICE: 'general_practice'
};

// Audio file constraints
export const AUDIO_CONSTRAINTS = {
    MAX_SIZE_MB: 100,
    MAX_SIZE_BYTES: 100 * 1024 * 1024,
    ALLOWED_TYPES: [
        'audio/mp3',
        'audio/wav', 
        'audio/m4a',
        'audio/mpeg',
        'audio/mp4',
        'audio/webm'
    ],
    ALLOWED_EXTENSIONS: ['.mp3', '.wav', '.m4a', '.mpeg', '.mp4', '.webm']
};

// Text input constraints
export const TEXT_CONSTRAINTS = {
    MIN_LENGTH: 50,
    MAX_LENGTH: 10000,
    RECOMMENDED_LENGTH: 100
};

/**
 * Progress Update Interface
 * @typedef {Object} ProgressUpdate
 * @property {number} currentStep - Current step index (0-based)
 * @property {number} totalSteps - Total number of steps
 * @property {string} stepId - Current step identifier
 * @property {string} stepLabel - Human-readable step description
 * @property {string} status - Step status (processing, completed, error)
 * @property {number} progress - Progress percentage (0-100)
 * @property {Object|null} error - Error information if step failed
 * @property {string} inputType - Type of input being processed (audio/text)
 */

/**
 * Processing Step Configuration
 * @typedef {Object} ProcessingStep
 * @property {string} id - Step identifier
 * @property {string} label - Human-readable step description
 * @property {number} estimatedTime - Estimated time in seconds
 */

/**
 * Audio File Information
 * @typedef {Object} AudioFileInfo
 * @property {File} file - The actual file object
 * @property {string} name - File name
 * @property {string} size - Human-readable file size
 * @property {string} duration - Audio duration (if available)
 */

/**
 * Validation Result
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether validation passed
 * @property {string[]} errors - Array of validation error messages
 */

/**
 * AI Processing Error
 * @typedef {Object} AIProcessingError
 * @property {string} message - User-friendly error message
 * @property {string} originalError - Original error message
 * @property {boolean} retryable - Whether the operation can be retried
 * @property {string} timestamp - Error timestamp
 */

/**
 * Transcription Result
 * @typedef {Object} TranscriptionResult
 * @property {string} jobId - Assembly AI job identifier
 * @property {string} status - Transcription status
 * @property {string} text - Transcribed text
 * @property {number} confidence - Transcription confidence score
 * @property {Object[]} words - Word-level transcription data
 * @property {string|null} error - Error message if transcription failed
 */

/**
 * Medical Specialty Detection Result
 * @typedef {Object} SpecialtyDetectionResult
 * @property {string} primarySpecialty - Primary detected specialty
 * @property {string[]} secondarySpecialties - Additional specialties detected
 * @property {number} confidence - Detection confidence score
 * @property {Object} keywords - Medical keywords found in text
 */

/**
 * Website Content Generation Result
 * @typedef {Object} ContentGenerationResult
 * @property {Object} pages - Generated page content
 * @property {string} pages.home - Home page content
 * @property {string} pages.about - About page content  
 * @property {string} pages.services - Services page content
 * @property {string} pages.contact - Contact page content
 * @property {Object} seo - SEO metadata
 * @property {string[]} keywords - Relevant keywords
 * @property {Object} styling - Styling preferences
 */

/**
 * Website Structure Result
 * @typedef {Object} WebsiteStructureResult
 * @property {string} websiteId - Generated website identifier
 * @property {Object} structure - Website structure
 * @property {Object} theme - Applied theme configuration
 * @property {string[]} features - Enabled features
 * @property {string} previewUrl - Preview URL
 */

/**
 * Complete AI Processing Result
 * @typedef {Object} AIProcessingResult
 * @property {boolean} success - Whether processing succeeded
 * @property {Object} data - Processing result data
 * @property {string} [data.transcription] - Transcribed text (audio only)
 * @property {string} [data.originalText] - Original text input (text only)
 * @property {string} data.processedText - Processed/cleaned text
 * @property {SpecialtyDetectionResult} data.specialty - Specialty detection result
 * @property {ContentGenerationResult} data.content - Generated content
 * @property {WebsiteStructureResult} data.website - Website structure
 */

/**
 * API Response Wrapper
 * @typedef {Object} APIResponse
 * @property {boolean} success - Whether API call succeeded
 * @property {Object} data - Response data
 * @property {string} message - Response message
 * @property {Object|null} error - Error details if request failed
 */

// Export default validation functions
export const validateAudioFile = (file) => {
    const errors = [];
    
    if (!file) {
        errors.push('No file provided');
        return { isValid: false, errors };
    }
    
    if (file.size > AUDIO_CONSTRAINTS.MAX_SIZE_BYTES) {
        errors.push(`File size must be under ${AUDIO_CONSTRAINTS.MAX_SIZE_MB}MB`);
    }
    
    if (!AUDIO_CONSTRAINTS.ALLOWED_TYPES.includes(file.type)) {
        errors.push('File must be in MP3, WAV, or M4A format');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

export const validateTextInput = (text) => {
    const errors = [];
    
    if (!text || text.trim().length < TEXT_CONSTRAINTS.MIN_LENGTH) {
        errors.push(`Text must be at least ${TEXT_CONSTRAINTS.MIN_LENGTH} characters long`);
    }
    
    if (text && text.length > TEXT_CONSTRAINTS.MAX_LENGTH) {
        errors.push(`Text must be under ${TEXT_CONSTRAINTS.MAX_LENGTH} characters`);
    }
    
    // Check for medical-related keywords
    const medicalKeywords = [
        'doctor', 'medical', 'practice', 'patient', 'clinic', 
        'hospital', 'specialty', 'treatment', 'physician', 
        'healthcare', 'medicine', 'therapy', 'diagnosis'
    ];
    
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
};

// Utility functions
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const getEstimatedProcessingTime = (inputType) => {
    const baseTimes = {
        [INPUT_TYPES.AUDIO]: 105, // seconds (includes transcription)
        [INPUT_TYPES.TEXT]: 70    // seconds (no transcription needed)
    };
    
    return baseTimes[inputType] || 90;
};

export const getSpecialtyDisplayName = (specialtyCode) => {
    const displayNames = {
        [MEDICAL_SPECIALTIES.CARDIOLOGY]: 'Cardiology',
        [MEDICAL_SPECIALTIES.DERMATOLOGY]: 'Dermatology',
        [MEDICAL_SPECIALTIES.ORTHOPEDICS]: 'Orthopedics',
        [MEDICAL_SPECIALTIES.PEDIATRICS]: 'Pediatrics',
        [MEDICAL_SPECIALTIES.NEUROLOGY]: 'Neurology',
        [MEDICAL_SPECIALTIES.ONCOLOGY]: 'Oncology',
        [MEDICAL_SPECIALTIES.PSYCHIATRY]: 'Psychiatry',
        [MEDICAL_SPECIALTIES.FAMILY_MEDICINE]: 'Family Medicine',
        [MEDICAL_SPECIALTIES.INTERNAL_MEDICINE]: 'Internal Medicine',
        [MEDICAL_SPECIALTIES.EMERGENCY_MEDICINE]: 'Emergency Medicine',
        [MEDICAL_SPECIALTIES.RADIOLOGY]: 'Radiology',
        [MEDICAL_SPECIALTIES.ANESTHESIOLOGY]: 'Anesthesiology',
        [MEDICAL_SPECIALTIES.SURGERY]: 'Surgery',
        [MEDICAL_SPECIALTIES.OBSTETRICS_GYNECOLOGY]: 'Obstetrics & Gynecology',
        [MEDICAL_SPECIALTIES.OPHTHALMOLOGY]: 'Ophthalmology',
        [MEDICAL_SPECIALTIES.ENT]: 'ENT (Ear, Nose & Throat)',
        [MEDICAL_SPECIALTIES.UROLOGY]: 'Urology',
        [MEDICAL_SPECIALTIES.PATHOLOGY]: 'Pathology',
        [MEDICAL_SPECIALTIES.GENERAL_PRACTICE]: 'General Practice'
    };
    
    return displayNames[specialtyCode] || specialtyCode;
};

export default {
    INPUT_TYPES,
    PROCESSING_STATUS,
    PROCESSING_STEPS,
    MEDICAL_SPECIALTIES,
    AUDIO_CONSTRAINTS,
    TEXT_CONSTRAINTS,
    validateAudioFile,
    validateTextInput,
    formatFileSize,
    formatDuration,
    getEstimatedProcessingTime,
    getSpecialtyDisplayName
};
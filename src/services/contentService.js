import apiService from '../utils/api.js';

/**
 * Content Service - Handles all content management operations
 */
class ContentService {
    constructor() {
        this.cache = new Map();
        this.changeHistory = [];
        this.currentVersion = 1;
    }

    /**
     * Transform website data into editable content structure
     * @param {Object} websiteData - Raw website data from AI processing
     * @returns {Object} Editable content structure
     */
    transformToEditableContent(websiteData) {
        if (!websiteData || !websiteData.content) {
            throw new Error('Invalid website data provided');
        }

        const { content, styling, metadata } = websiteData;
        
        return {
            id: websiteData.id || `content_${Date.now()}`,
            version: this.currentVersion,
            lastModified: new Date().toISOString(),
            pages: {
                home: {
                    hero: {
                        title: {
                            text: content.hero?.title || 'Welcome to Our Practice',
                            editable: true,
                            type: 'text',
                            maxLength: 60,
                            required: true,
                            section: 'hero'
                        },
                        subtitle: {
                            text: content.hero?.subtitle || 'Providing excellent medical care',
                            editable: true,
                            type: 'text',
                            maxLength: 160,
                            required: false,
                            section: 'hero'
                        },
                        cta: {
                            text: content.hero?.cta || 'Schedule Appointment',
                            editable: true,
                            type: 'button',
                            maxLength: 30,
                            required: true,
                            section: 'hero'
                        }
                    },
                    header: {
                        title: {
                            text: content.header?.title || 'Medical Practice',
                            editable: true,
                            type: 'text',
                            maxLength: 50,
                            required: true,
                            section: 'header'
                        },
                        navigation: {
                            items: content.header?.navigation || ['Home', 'About', 'Services', 'Contact'],
                            editable: true,
                            type: 'list',
                            maxItems: 8,
                            required: true,
                            section: 'header'
                        }
                    },
                    about: {
                        heading: {
                            text: content.about?.title || 'About Our Practice',
                            editable: true,
                            type: 'text',
                            maxLength: 60,
                            required: true,
                            section: 'about'
                        },
                        content: {
                            text: content.about?.content || 'Learn more about our medical practice and expertise.',
                            editable: true,
                            type: 'rich-text',
                            maxLength: 2000,
                            minLength: 50,
                            required: true,
                            section: 'about'
                        },
                        image: {
                            src: content.about?.image || null,
                            alt: content.about?.imageAlt || 'About our practice',
                            editable: true,
                            type: 'image',
                            required: false,
                            section: 'about'
                        }
                    },
                    services: {
                        heading: {
                            text: 'Our Services',
                            editable: true,
                            type: 'text',
                            maxLength: 60,
                            required: true,
                            section: 'services'
                        },
                        items: (content.services || []).map((service, index) => ({
                            id: `service_${index}`,
                            name: {
                                text: service.name || 'Medical Service',
                                editable: true,
                                type: 'text',
                                maxLength: 80,
                                required: true,
                                section: 'services'
                            },
                            description: {
                                text: service.description || 'Professional medical service description.',
                                editable: true,
                                type: 'textarea',
                                maxLength: 300,
                                required: true,
                                section: 'services'
                            },
                            icon: {
                                type: 'icon',
                                value: service.icon || 'medical',
                                editable: true,
                                required: false,
                                section: 'services'
                            }
                        }))
                    },
                    contact: {
                        heading: {
                            text: content.contact?.title || 'Contact Information',
                            editable: true,
                            type: 'text',
                            maxLength: 60,
                            required: true,
                            section: 'contact'
                        },
                        address: {
                            text: content.contact?.address || '',
                            editable: true,
                            type: 'textarea',
                            maxLength: 200,
                            required: false,
                            section: 'contact'
                        },
                        phone: {
                            text: content.contact?.phone || '',
                            editable: true,
                            type: 'phone',
                            pattern: /^[\d\s\-\+\(\)]+$/,
                            required: false,
                            section: 'contact'
                        },
                        email: {
                            text: content.contact?.email || '',
                            editable: true,
                            type: 'email',
                            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            required: false,
                            section: 'contact'
                        },
                        hours: {
                            text: content.contact?.hours || '',
                            editable: true,
                            type: 'textarea',
                            maxLength: 300,
                            required: false,
                            section: 'contact'
                        }
                    },
                    footer: {
                        copyright: {
                            text: content.footer?.copyright || `© ${new Date().getFullYear()} Medical Practice. All rights reserved.`,
                            editable: true,
                            type: 'text',
                            maxLength: 100,
                            required: true,
                            section: 'footer'
                        },
                        links: {
                            items: content.footer?.links || ['Privacy Policy', 'Terms of Service'],
                            editable: true,
                            type: 'list',
                            maxItems: 5,
                            required: false,
                            section: 'footer'
                        }
                    }
                }
            },
            metadata: {
                title: {
                    text: metadata?.title || content.header?.title || 'Medical Practice',
                    editable: true,
                    type: 'text',
                    maxLength: 60,
                    required: true,
                    section: 'metadata'
                },
                description: {
                    text: metadata?.description || content.hero?.subtitle || 'Professional medical practice',
                    editable: true,
                    type: 'textarea',
                    maxLength: 160,
                    required: true,
                    section: 'metadata'
                }
            },
            styling: {
                primaryColor: styling?.primaryColor || '#2563eb',
                secondaryColor: styling?.secondaryColor || '#16a34a',
                accentColor: styling?.accentColor || '#f59e0b',
                fontFamily: styling?.fontFamily || 'Inter, sans-serif',
                theme: styling?.theme || 'modern'
            }
        };
    }

    /**
     * Transform editable content back to website format
     * @param {Object} editableContent - Editable content structure
     * @returns {Object} Website data format
     */
    transformToWebsiteData(editableContent) {
        if (!editableContent || !editableContent.pages) {
            throw new Error('Invalid editable content provided');
        }

        const { pages, styling, metadata } = editableContent;
        const homePage = pages.home;

        return {
            id: editableContent.id,
            version: editableContent.version,
            lastModified: editableContent.lastModified,
            content: {
                header: {
                    title: homePage.header.title.text,
                    navigation: homePage.header.navigation.items
                },
                hero: {
                    title: homePage.hero.title.text,
                    subtitle: homePage.hero.subtitle.text,
                    cta: homePage.hero.cta.text
                },
                about: {
                    title: homePage.about.heading.text,
                    content: homePage.about.content.text,
                    image: homePage.about.image.src,
                    imageAlt: homePage.about.image.alt
                },
                services: homePage.services.items.map(service => ({
                    name: service.name.text,
                    description: service.description.text,
                    icon: service.icon.value
                })),
                contact: {
                    title: homePage.contact.heading.text,
                    address: homePage.contact.address.text,
                    phone: homePage.contact.phone.text,
                    email: homePage.contact.email.text,
                    hours: homePage.contact.hours.text
                },
                footer: {
                    copyright: homePage.footer.copyright.text,
                    links: homePage.footer.links.items
                }
            },
            styling,
            metadata: {
                title: metadata.title.text,
                description: metadata.description.text
            }
        };
    }

    /**
     * Update content field
     * @param {Object} contentData - Current content data
     * @param {string} path - Path to the field (e.g., 'pages.home.hero.title.text')
     * @param {*} value - New value
     * @returns {Object} Updated content data
     */
    updateContent(contentData, path, value) {
        const pathArray = path.split('.');
        const updatedData = JSON.parse(JSON.stringify(contentData));
        
        // Navigate to the target field
        let current = updatedData;
        for (let i = 0; i < pathArray.length - 1; i++) {
            current = current[pathArray[i]];
        }
        
        // Update the value
        current[pathArray[pathArray.length - 1]] = value;
        
        // Update metadata
        updatedData.lastModified = new Date().toISOString();
        updatedData.version = (updatedData.version || 0) + 1;
        
        // Track change in history
        this.addToHistory({
            action: 'update',
            path,
            oldValue: this.getValueAtPath(contentData, path),
            newValue: value,
            timestamp: new Date().toISOString()
        });
        
        return updatedData;
    }

    /**
     * Get value at specific path
     * @param {Object} obj - Object to search
     * @param {string} path - Path to value
     * @returns {*} Value at path
     */
    getValueAtPath(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    /**
     * Add service to services list
     * @param {Object} contentData - Current content data
     * @param {Object} serviceData - Service data to add
     * @returns {Object} Updated content data
     */
    addService(contentData, serviceData) {
        const updatedData = JSON.parse(JSON.stringify(contentData));
        const serviceId = `service_${Date.now()}`;
        
        const newService = {
            id: serviceId,
            name: {
                text: serviceData.name || 'New Service',
                editable: true,
                type: 'text',
                maxLength: 80,
                required: true,
                section: 'services'
            },
            description: {
                text: serviceData.description || 'Service description',
                editable: true,
                type: 'textarea',
                maxLength: 300,
                required: true,
                section: 'services'
            },
            icon: {
                type: 'icon',
                value: serviceData.icon || 'medical',
                editable: true,
                required: false,
                section: 'services'
            }
        };
        
        updatedData.pages.home.services.items.push(newService);
        updatedData.lastModified = new Date().toISOString();
        updatedData.version = (updatedData.version || 0) + 1;
        
        this.addToHistory({
            action: 'add_service',
            serviceId,
            serviceData: newService,
            timestamp: new Date().toISOString()
        });
        
        return updatedData;
    }

    /**
     * Remove service from services list
     * @param {Object} contentData - Current content data
     * @param {string} serviceId - Service ID to remove
     * @returns {Object} Updated content data
     */
    removeService(contentData, serviceId) {
        const updatedData = JSON.parse(JSON.stringify(contentData));
        const services = updatedData.pages.home.services.items;
        const serviceIndex = services.findIndex(service => service.id === serviceId);
        
        if (serviceIndex > -1) {
            const removedService = services.splice(serviceIndex, 1)[0];
            updatedData.lastModified = new Date().toISOString();
            updatedData.version = (updatedData.version || 0) + 1;
            
            this.addToHistory({
                action: 'remove_service',
                serviceId,
                serviceData: removedService,
                timestamp: new Date().toISOString()
            });
        }
        
        return updatedData;
    }

    /**
     * Validate content field
     * @param {Object} field - Field configuration
     * @param {*} value - Value to validate
     * @returns {Object} Validation result
     */
    validateField(field, value) {
        const errors = [];
        
        // Check required fields
        if (field.required && (!value || value.toString().trim() === '')) {
            errors.push('This field is required');
        }
        
        // Check string length constraints
        if (value && typeof value === 'string') {
            if (field.maxLength && value.length > field.maxLength) {
                errors.push(`Maximum length is ${field.maxLength} characters`);
            }
            if (field.minLength && value.length < field.minLength) {
                errors.push(`Minimum length is ${field.minLength} characters`);
            }
        }
        
        // Check pattern matching
        if (field.pattern && value && !field.pattern.test(value)) {
            switch (field.type) {
                case 'email':
                    errors.push('Please enter a valid email address');
                    break;
                case 'phone':
                    errors.push('Please enter a valid phone number');
                    break;
                default:
                    errors.push('Invalid format');
            }
        }
        
        // Check array constraints
        if (field.type === 'list' && Array.isArray(value)) {
            if (field.maxItems && value.length > field.maxItems) {
                errors.push(`Maximum ${field.maxItems} items allowed`);
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate entire content structure
     * @param {Object} contentData - Content data to validate
     * @returns {Object} Validation result
     */
    validateContent(contentData) {
        const errors = {};
        const warnings = [];
        
        // Validate all editable fields
        this.traverseEditableFields(contentData, (field, value, path) => {
            const validation = this.validateField(field, value);
            if (!validation.isValid) {
                errors[path] = validation.errors;
            }
        });
        
        // Check for SEO recommendations
        const title = contentData.metadata?.title?.text;
        const description = contentData.metadata?.description?.text;
        
        if (title && title.length < 30) {
            warnings.push('Page title could be more descriptive (recommended 30-60 characters)');
        }
        if (description && description.length < 120) {
            warnings.push('Meta description could be more detailed (recommended 120-160 characters)');
        }
        
        // Check for contact information completeness
        const contact = contentData.pages?.home?.contact;
        if (!contact?.phone?.text && !contact?.email?.text) {
            warnings.push('Consider adding phone or email contact information');
        }
        
        return {
            isValid: Object.keys(errors).length === 0,
            errors,
            warnings
        };
    }

    /**
     * Traverse all editable fields in content structure
     * @param {Object} obj - Object to traverse
     * @param {Function} callback - Callback function for each field
     * @param {string} currentPath - Current path in traversal
     */
    traverseEditableFields(obj, callback, currentPath = '') {
        if (!obj || typeof obj !== 'object') return;
        
        Object.keys(obj).forEach(key => {
            const value = obj[key];
            const path = currentPath ? `${currentPath}.${key}` : key;
            
            if (value && typeof value === 'object') {
                if (value.editable) {
                    callback(value, value.text || value.items || value.src, path);
                } else {
                    this.traverseEditableFields(value, callback, path);
                }
            }
        });
    }

    /**
     * Add change to history
     * @param {Object} change - Change object
     */
    addToHistory(change) {
        this.changeHistory.push(change);
        
        // Keep only last 50 changes
        if (this.changeHistory.length > 50) {
            this.changeHistory.shift();
        }
    }

    /**
     * Get change history
     * @returns {Array} Array of changes
     */
    getHistory() {
        return [...this.changeHistory];
    }

    /**
     * Clear change history
     */
    clearHistory() {
        this.changeHistory = [];
    }

    /**
     * Save content to backend
     * @param {Object} contentData - Content data to save
     * @returns {Promise} Save result
     */
    async saveContent(contentData) {
        try {
            // Validate before saving
            const validation = this.validateContent(contentData);
            if (!validation.isValid) {
                throw new Error('Content validation failed');
            }
            
            // Transform to website format
            const websiteData = this.transformToWebsiteData(contentData);
            
            // Save to backend
            const result = await apiService.makeRequest('/api/v1/content/save', {
                method: 'POST',
                body: {
                    id: contentData.id,
                    content: websiteData,
                    version: contentData.version
                }
            });
            
            // Update cache
            this.cache.set(contentData.id, {
                data: contentData,
                timestamp: Date.now()
            });
            
            return {
                success: true,
                data: result.data,
                savedAt: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('Failed to save content:', error);
            throw error;
        }
    }

    /**
     * Load content from backend
     * @param {string} contentId - Content ID to load
     * @returns {Promise} Content data
     */
    async loadContent(contentId) {
        try {
            // Check cache first
            const cached = this.cache.get(contentId);
            if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
                return cached.data;
            }
            
            // Load from backend
            const result = await apiService.makeRequest(`/api/v1/content/${contentId}`);
            const contentData = this.transformToEditableContent(result.data);
            
            // Update cache
            this.cache.set(contentId, {
                data: contentData,
                timestamp: Date.now()
            });
            
            return contentData;
            
        } catch (error) {
            console.error('Failed to load content:', error);
            throw error;
        }
    }

    /**
     * Auto-save content
     * @param {Object} contentData - Content data to auto-save
     * @param {number} debounceMs - Debounce time in milliseconds
     */
    autoSave(contentData, debounceMs = 2000) {
        if (this.autoSaveTimeout) {
            clearTimeout(this.autoSaveTimeout);
        }
        
        this.autoSaveTimeout = setTimeout(() => {
            this.saveContent(contentData)
                .then(() => {
                    console.log('Content auto-saved successfully');
                })
                .catch(error => {
                    console.error('Auto-save failed:', error);
                });
        }, debounceMs);
    }

    /**
     * Clear auto-save timeout
     */
    clearAutoSave() {
        if (this.autoSaveTimeout) {
            clearTimeout(this.autoSaveTimeout);
            this.autoSaveTimeout = null;
        }
    }
}

export default new ContentService();
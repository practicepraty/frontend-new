import apiService from '../utils/api.js';

class PreviewService {
    constructor() {
        this.previewCache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Format backend website data for preview display
     * @param {Object} backendData - Raw data from backend API
     * @returns {Object} Formatted website data for preview
     */
    formatWebsiteData(backendData) {
        if (!backendData) {
            throw new Error('No website data provided');
        }

        // If the backend data is already in the expected format, return as-is
        if (this.isValidWebsiteData(backendData)) {
            return backendData;
        }

        // Handle different possible backend response formats
        let websiteData = backendData;
        
        // If data is nested under a 'data' or 'result' property
        if (backendData.data && typeof backendData.data === 'object') {
            websiteData = backendData.data;
        } else if (backendData.result && typeof backendData.result === 'object') {
            websiteData = backendData.result;
        }

        // Extract and format the website structure
        const formatted = {
            id: websiteData.id || websiteData.websiteId || `website_${Date.now()}`,
            specialty: this.extractSpecialty(websiteData),
            template: websiteData.template || websiteData.templateName || 'medical-modern',
            content: this.formatContent(websiteData),
            styling: this.formatStyling(websiteData),
            html: websiteData.html || websiteData.generatedHtml || null,
            css: websiteData.css || websiteData.generatedCss || null,
            metadata: {
                generatedAt: websiteData.createdAt || websiteData.generatedAt || new Date().toISOString(),
                version: websiteData.version || '1.0',
                inputType: websiteData.inputType || 'unknown'
            }
        };

        // Validate the formatted data
        if (!this.isValidWebsiteData(formatted)) {
            console.warn('Formatted website data may be incomplete:', formatted);
        }

        return formatted;
    }

    /**
     * Extract medical specialty from various possible data structures
     * @param {Object} data - Website data
     * @returns {string} Medical specialty
     */
    extractSpecialty(data) {
        return data.specialty || 
               data.medicalSpecialty || 
               data.practiceType || 
               data.content?.specialty ||
               data.doctorInfo?.specialty ||
               'general-practice';
    }

    /**
     * Format content structure from backend data
     * @param {Object} data - Raw website data
     * @returns {Object} Formatted content structure
     */
    formatContent(data) {
        const content = data.content || data.siteContent || {};
        
        return {
            header: this.formatHeader(content.header || data.header || {}),
            hero: this.formatHero(content.hero || data.hero || {}),
            about: this.formatAbout(content.about || data.about || {}),
            services: this.formatServices(content.services || data.services || []),
            contact: this.formatContact(content.contact || data.contact || {}),
            footer: this.formatFooter(content.footer || data.footer || {})
        };
    }

    /**
     * Format header section
     * @param {Object} header - Header data
     * @returns {Object} Formatted header
     */
    formatHeader(header) {
        return {
            title: header.title || header.practiceTitle || header.name || 'Medical Practice',
            subtitle: header.subtitle || header.tagline || null,
            logo: header.logo || header.logoUrl || null,
            navigation: Array.isArray(header.navigation) 
                ? header.navigation 
                : (header.nav || ['Home', 'About', 'Services', 'Contact'])
        };
    }

    /**
     * Format hero section
     * @param {Object} hero - Hero data
     * @returns {Object} Formatted hero
     */
    formatHero(hero) {
        return {
            title: hero.title || hero.headline || 'Welcome to Our Practice',
            subtitle: hero.subtitle || hero.description || hero.subheadline || null,
            cta: hero.cta || hero.ctaText || hero.buttonText || 'Schedule Appointment',
            ctaLink: hero.ctaLink || hero.ctaUrl || '#contact',
            backgroundImage: hero.backgroundImage || hero.bgImage || null
        };
    }

    /**
     * Format about section
     * @param {Object} about - About data
     * @returns {Object} Formatted about
     */
    formatAbout(about) {
        return {
            title: about.title || 'About Our Practice',
            content: about.content || about.description || about.text || 'Learn more about our medical practice and expertise.',
            image: about.image || about.imageUrl || null,
            highlights: Array.isArray(about.highlights) ? about.highlights : []
        };
    }

    /**
     * Format services section
     * @param {Array|Object} services - Services data
     * @returns {Array} Formatted services array
     */
    formatServices(services) {
        if (!services) return [];
        
        // Handle both array and object formats
        const servicesList = Array.isArray(services) ? services : Object.values(services);
        
        return servicesList.map(service => {
            if (typeof service === 'string') {
                return {
                    name: service,
                    description: `Professional ${service.toLowerCase()} services.`,
                    icon: null
                };
            }
            
            return {
                name: service.name || service.title || service.service || 'Medical Service',
                description: service.description || service.details || service.summary || 'Professional medical service.',
                icon: service.icon || service.iconName || null,
                features: Array.isArray(service.features) ? service.features : []
            };
        });
    }

    /**
     * Format contact section
     * @param {Object} contact - Contact data
     * @returns {Object} Formatted contact
     */
    formatContact(contact) {
        return {
            title: contact.title || 'Contact Information',
            address: contact.address || contact.location || contact.clinicAddress || null,
            phone: contact.phone || contact.phoneNumber || contact.tel || null,
            email: contact.email || contact.emailAddress || null,
            hours: contact.hours || contact.workingHours || contact.officeHours || null,
            mapEmbed: contact.mapEmbed || contact.mapUrl || null
        };
    }

    /**
     * Format footer section
     * @param {Object} footer - Footer data
     * @returns {Object} Formatted footer
     */
    formatFooter(footer) {
        return {
            copyright: footer.copyright || footer.copyrightText || `© ${new Date().getFullYear()} Medical Practice. All rights reserved.`,
            links: Array.isArray(footer.links) 
                ? footer.links 
                : (footer.footerLinks || ['Privacy Policy', 'Terms of Service']),
            socialMedia: footer.socialMedia || footer.social || {}
        };
    }

    /**
     * Format styling information
     * @param {Object} data - Website data
     * @returns {Object} Formatted styling
     */
    formatStyling(data) {
        const styling = data.styling || data.theme || data.styles || {};
        
        return {
            primaryColor: styling.primaryColor || styling.primary || '#2563eb',
            secondaryColor: styling.secondaryColor || styling.secondary || '#16a34a',
            accentColor: styling.accentColor || styling.accent || '#f59e0b',
            fontFamily: styling.fontFamily || styling.font || 'Inter, sans-serif',
            theme: styling.theme || styling.themeName || 'modern',
            layout: styling.layout || 'standard'
        };
    }

    /**
     * Validate website data structure
     * @param {Object} data - Website data to validate
     * @returns {boolean} True if valid
     */
    isValidWebsiteData(data) {
        if (!data || typeof data !== 'object') return false;
        
        // Check for essential properties
        const hasContent = data.content && typeof data.content === 'object';
        const hasHtml = typeof data.html === 'string' && data.html.length > 0;
        
        // Either structured content or raw HTML should be present
        return hasContent || hasHtml;
    }

    /**
     * Generate preview HTML from website data
     * @param {Object} websiteData - Formatted website data
     * @returns {string} HTML string for preview
     */
    generatePreviewHTML(websiteData) {
        if (!websiteData) {
            return this.getErrorHTML('No website data available');
        }

        // If complete HTML is provided, use it
        if (websiteData.html && typeof websiteData.html === 'string') {
            return this.enhanceHTML(websiteData.html, websiteData.styling);
        }

        // Generate HTML from content structure
        return this.buildHTMLFromContent(websiteData);
    }

    /**
     * Enhance existing HTML with additional functionality
     * @param {string} html - Original HTML
     * @param {Object} styling - Styling configuration
     * @returns {string} Enhanced HTML
     */
    enhanceHTML(html, styling = {}) {
        // Add meta tags and viewport if missing
        if (!html.includes('<meta name="viewport"')) {
            html = html.replace('<head>', '<head><meta name="viewport" content="width=device-width, initial-scale=1.0">');
        }

        // Add CSS custom properties for theming
        const cssVars = `
            <style>
                :root {
                    --primary-color: ${styling.primaryColor || '#2563eb'};
                    --secondary-color: ${styling.secondaryColor || '#16a34a'};
                    --accent-color: ${styling.accentColor || '#f59e0b'};
                    --font-family: ${styling.fontFamily || 'Inter, sans-serif'};
                }
                .highlight { outline: 3px solid #fbbf24; outline-offset: 2px; }
            </style>
        `;
        
        html = html.replace('</head>', cssVars + '</head>');

        // Add section highlighting script
        const script = `
            <script>
                window.addEventListener('message', function(event) {
                    if (event.data.type === 'highlight-section') {
                        document.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight'));
                        if (event.data.section) {
                            const section = document.querySelector('[data-section="' + event.data.section + '"]');
                            if (section) {
                                section.classList.add('highlight');
                                section.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                        }
                    }
                });
            </script>
        `;
        
        html = html.replace('</body>', script + '</body>');

        return html;
    }

    /**
     * Build HTML from content structure
     * @param {Object} websiteData - Website data
     * @returns {string} Generated HTML
     */
    buildHTMLFromContent(websiteData) {
        const { content, styling } = websiteData;
        
        if (!content) {
            return this.getErrorHTML('No content structure available');
        }

        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${content.header?.title || 'Medical Practice'}</title>
                <style>
                    :root {
                        --primary-color: ${styling?.primaryColor || '#2563eb'};
                        --secondary-color: ${styling?.secondaryColor || '#16a34a'};
                        --accent-color: ${styling?.accentColor || '#f59e0b'};
                        --font-family: ${styling?.fontFamily || 'Inter, sans-serif'};
                    }
                    
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    
                    body {
                        font-family: var(--font-family);
                        line-height: 1.6;
                        color: #333;
                        background: #ffffff;
                    }
                    
                    .header {
                        background: var(--primary-color);
                        color: white;
                        padding: 1rem 2rem;
                        position: sticky;
                        top: 0;
                        z-index: 100;
                    }
                    
                    .header h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
                    .header nav a {
                        color: white;
                        text-decoration: none;
                        margin-right: 1.5rem;
                        padding: 0.5rem 0;
                        border-bottom: 2px solid transparent;
                        transition: border-color 0.3s;
                    }
                    .header nav a:hover { border-bottom-color: white; }
                    
                    .hero {
                        background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
                        color: white;
                        padding: 4rem 2rem;
                        text-align: center;
                        min-height: 60vh;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                    }
                    
                    .hero h1 { font-size: 3rem; margin-bottom: 1rem; font-weight: 700; }
                    .hero p { font-size: 1.25rem; margin-bottom: 2rem; opacity: 0.9; }
                    .hero button {
                        background: white;
                        color: var(--primary-color);
                        padding: 1rem 2rem;
                        border: none;
                        border-radius: 0.5rem;
                        font-size: 1.1rem;
                        font-weight: 600;
                        cursor: pointer;
                        transition: transform 0.3s, box-shadow 0.3s;
                    }
                    .hero button:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    }
                    
                    .section {
                        padding: 4rem 2rem;
                        max-width: 1200px;
                        margin: 0 auto;
                    }
                    
                    .section h2 {
                        font-size: 2.5rem;
                        margin-bottom: 2rem;
                        color: var(--primary-color);
                        text-align: center;
                    }
                    
                    .services {
                        background: #f8fafc;
                    }
                    
                    .services-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                        gap: 2rem;
                        margin-top: 3rem;
                    }
                    
                    .service-card {
                        background: white;
                        padding: 2rem;
                        border-radius: 1rem;
                        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                        transition: transform 0.3s, box-shadow 0.3s;
                    }
                    
                    .service-card:hover {
                        transform: translateY(-4px);
                        box-shadow: 0 8px 25px rgba(0,0,0,0.15);
                    }
                    
                    .service-card h3 {
                        color: var(--primary-color);
                        margin-bottom: 1rem;
                        font-size: 1.25rem;
                    }
                    
                    .contact-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                        gap: 2rem;
                        margin-top: 2rem;
                    }
                    
                    .contact-item {
                        background: #f8fafc;
                        padding: 1.5rem;
                        border-radius: 0.5rem;
                        border-left: 4px solid var(--accent-color);
                    }
                    
                    .contact-item strong {
                        color: var(--primary-color);
                        display: block;
                        margin-bottom: 0.5rem;
                    }
                    
                    .footer {
                        background: #1f2937;
                        color: white;
                        padding: 3rem 2rem 2rem;
                        text-align: center;
                    }
                    
                    .footer-links {
                        margin: 1rem 0;
                    }
                    
                    .footer-links a {
                        color: white;
                        text-decoration: none;
                        margin: 0 1rem;
                        opacity: 0.8;
                        transition: opacity 0.3s;
                    }
                    
                    .footer-links a:hover { opacity: 1; }
                    
                    .highlight {
                        outline: 3px solid #fbbf24;
                        outline-offset: 2px;
                        animation: pulse 2s infinite;
                    }
                    
                    @keyframes pulse {
                        0%, 100% { outline-color: #fbbf24; }
                        50% { outline-color: #f59e0b; }
                    }
                    
                    @media (max-width: 768px) {
                        .hero h1 { font-size: 2rem; }
                        .hero p { font-size: 1rem; }
                        .section { padding: 3rem 1rem; }
                        .section h2 { font-size: 2rem; }
                        .header { padding: 1rem; }
                        .header nav a { display: block; margin: 0.25rem 0; }
                    }
                </style>
            </head>
            <body>
                ${this.generateHeaderHTML(content.header)}
                ${this.generateHeroHTML(content.hero)}
                ${this.generateAboutHTML(content.about)}
                ${this.generateServicesHTML(content.services)}
                ${this.generateContactHTML(content.contact)}
                ${this.generateFooterHTML(content.footer)}
                
                <script>
                    window.addEventListener('message', function(event) {
                        if (event.data.type === 'highlight-section') {
                            document.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight'));
                            if (event.data.section) {
                                const section = document.querySelector('[data-section="' + event.data.section + '"]');
                                if (section) {
                                    section.classList.add('highlight');
                                    section.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }
                            }
                        }
                    });
                </script>
            </body>
            </html>
        `;
    }

    generateHeaderHTML(header) {
        if (!header) return '';
        
        return `
            <header class="header" data-section="header">
                <h1>${header.title || 'Medical Practice'}</h1>
                ${header.navigation ? `
                    <nav>
                        ${header.navigation.map(item => 
                            `<a href="#${item.toLowerCase().replace(/\s+/g, '-')}">${item}</a>`
                        ).join('')}
                    </nav>
                ` : ''}
            </header>
        `;
    }

    generateHeroHTML(hero) {
        if (!hero) return '';
        
        return `
            <section class="hero" data-section="hero">
                <h1>${hero.title || 'Welcome to Our Practice'}</h1>
                ${hero.subtitle ? `<p>${hero.subtitle}</p>` : ''}
                ${hero.cta ? `<button>${hero.cta}</button>` : ''}
            </section>
        `;
    }

    generateAboutHTML(about) {
        if (!about) return '';
        
        return `
            <section class="section" data-section="about">
                <h2>${about.title || 'About Our Practice'}</h2>
                <p>${about.content || 'Learn more about our medical practice and expertise.'}</p>
            </section>
        `;
    }

    generateServicesHTML(services) {
        if (!services || !Array.isArray(services)) return '';
        
        return `
            <section class="section services" data-section="services">
                <h2>Our Services</h2>
                <div class="services-grid">
                    ${services.map(service => `
                        <div class="service-card">
                            <h3>${service.name || 'Medical Service'}</h3>
                            <p>${service.description || 'Professional medical service description.'}</p>
                        </div>
                    `).join('')}
                </div>
            </section>
        `;
    }

    generateContactHTML(contact) {
        if (!contact) return '';
        
        return `
            <section class="section" data-section="contact">
                <h2>${contact.title || 'Contact Information'}</h2>
                <div class="contact-grid">
                    ${contact.address ? `
                        <div class="contact-item">
                            <strong>Address</strong>
                            ${contact.address}
                        </div>
                    ` : ''}
                    ${contact.phone ? `
                        <div class="contact-item">
                            <strong>Phone</strong>
                            ${contact.phone}
                        </div>
                    ` : ''}
                    ${contact.email ? `
                        <div class="contact-item">
                            <strong>Email</strong>
                            ${contact.email}
                        </div>
                    ` : ''}
                    ${contact.hours ? `
                        <div class="contact-item">
                            <strong>Hours</strong>
                            ${contact.hours}
                        </div>
                    ` : ''}
                </div>
            </section>
        `;
    }

    generateFooterHTML(footer) {
        if (!footer) return '';
        
        return `
            <footer class="footer" data-section="footer">
                <p>${footer.copyright || '© 2024 Medical Practice. All rights reserved.'}</p>
                ${footer.links && footer.links.length > 0 ? `
                    <div class="footer-links">
                        ${footer.links.map(link => `<a href="#">${link}</a>`).join('')}
                    </div>
                ` : ''}
            </footer>
        `;
    }

    /**
     * Get error HTML for display
     * @param {string} message - Error message
     * @returns {string} Error HTML
     */
    getErrorHTML(message) {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Preview Error</title>
                <style>
                    body {
                        font-family: system-ui, -apple-system, sans-serif;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                        margin: 0;
                        background: #f3f4f6;
                        color: #374151;
                    }
                    .error {
                        text-align: center;
                        padding: 2rem;
                        background: white;
                        border-radius: 0.5rem;
                        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    }
                    .error-icon {
                        font-size: 3rem;
                        margin-bottom: 1rem;
                    }
                </style>
            </head>
            <body>
                <div class="error">
                    <div class="error-icon">⚠️</div>
                    <h2>Preview Error</h2>
                    <p>${message}</p>
                </div>
            </body>
            </html>
        `;
    }

    /**
     * Refresh website data from backend
     * @param {string} websiteId - Website ID
     * @returns {Promise<Object>} Updated website data
     */
    async refreshWebsiteData(websiteId) {
        try {
            const response = await apiService.makeRequest(`/api/v1/websites/${websiteId}`);
            const websiteData = this.formatWebsiteData(response.data);
            
            // Update cache
            this.setCache(websiteId, websiteData);
            
            return websiteData;
        } catch (error) {
            console.error('Failed to refresh website data:', error);
            throw error;
        }
    }

    /**
     * Cache management
     */
    setCache(key, data) {
        this.previewCache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    getCache(key) {
        const cached = this.previewCache.get(key);
        if (!cached) return null;
        
        // Check if cache is expired
        if (Date.now() - cached.timestamp > this.cacheTimeout) {
            this.previewCache.delete(key);
            return null;
        }
        
        return cached.data;
    }

    clearCache() {
        this.previewCache.clear();
    }
}

export default new PreviewService();
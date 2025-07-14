import React, { useState, useRef, useEffect } from 'react';
import { AlertCircle, RefreshCw, Maximize2, Monitor, Tablet, Smartphone } from 'lucide-react';
import LoadingSkeleton from './LoadingSkeleton.jsx';
import apiService from '../utils/api.js';

export default function WebsitePreview({ 
    websiteData, 
    websiteId,
    isLoading = false, 
    error = null, 
    onRefresh, 
    className = "" 
}) {
    const [currentView, setCurrentView] = useState('desktop');
    const [zoomLevel, setZoomLevel] = useState(100);
    const [highlightedSection, setHighlightedSection] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [iframeLoading, setIframeLoading] = useState(true);
    const [iframeError, setIframeError] = useState(null);
    
    const iframeRef = useRef(null);
    const containerRef = useRef(null);

    // Responsive breakpoints and configurations
    const viewConfigs = {
        desktop: { width: '100%', maxWidth: '1200px', label: 'Desktop', icon: Monitor },
        tablet: { width: '768px', maxWidth: '768px', label: 'Tablet', icon: Tablet },
        mobile: { width: '375px', maxWidth: '375px', label: 'Mobile', icon: Smartphone }
    };

    const zoomLevels = [50, 75, 100, 125, 150];

    // Generate preview HTML from website data
    const generatePreviewHTML = () => {
        if (!websiteData) return '';

        // If websiteData has complete HTML, use it directly
        if (websiteData.html) {
            return websiteData.html;
        }

        // Otherwise, construct HTML from content structure
        const { content, styling } = websiteData;
        if (!content) return '<div>No content available</div>';

        const styles = styling ? `
            <style>
                :root {
                    --primary-color: ${styling.primaryColor || '#2563eb'};
                    --secondary-color: ${styling.secondaryColor || '#16a34a'};
                    --font-family: ${styling.fontFamily || 'Inter, sans-serif'};
                }
                
                body {
                    margin: 0;
                    padding: 0;
                    font-family: var(--font-family);
                    line-height: 1.6;
                    color: #333;
                }
                
                .header {
                    background: var(--primary-color);
                    color: white;
                    padding: 1rem 2rem;
                }
                
                .hero {
                    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
                    color: white;
                    padding: 4rem 2rem;
                    text-align: center;
                }
                
                .section {
                    padding: 3rem 2rem;
                    max-width: 1200px;
                    margin: 0 auto;
                }
                
                .services {
                    background: #f8fafc;
                }
                
                .footer {
                    background: #1f2937;
                    color: white;
                    padding: 2rem;
                    text-align: center;
                }
                
                .highlight {
                    outline: 3px solid #fbbf24;
                    outline-offset: 2px;
                }

                @media (max-width: 768px) {
                    .section {
                        padding: 2rem 1rem;
                    }
                    .hero {
                        padding: 3rem 1rem;
                    }
                }
            </style>
        ` : '';

        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${content.header?.title || 'Medical Practice'}</title>
                ${styles}
            </head>
            <body>
                <header class="header" data-section="header">
                    <h1>${content.header?.title || 'Medical Practice'}</h1>
                    ${content.header?.navigation ? `
                        <nav>
                            ${content.header.navigation.map(item => `<a href="#${item.toLowerCase()}" style="color: white; margin-right: 1rem; text-decoration: none;">${item}</a>`).join('')}
                        </nav>
                    ` : ''}
                </header>

                <section class="hero" data-section="hero">
                    <h1>${content.hero?.title || 'Welcome to Our Practice'}</h1>
                    <p>${content.hero?.subtitle || 'Providing excellent medical care'}</p>
                    ${content.hero?.cta ? `<button style="background: white; color: var(--primary-color); padding: 0.75rem 1.5rem; border: none; border-radius: 0.5rem; font-weight: bold; margin-top: 1rem;">${content.hero.cta}</button>` : ''}
                </section>

                <section class="section" data-section="about">
                    <h2>About Our Practice</h2>
                    <p>${content.about?.content || 'Learn more about our medical practice and expertise.'}</p>
                </section>

                <section class="section services" data-section="services">
                    <h2>Our Services</h2>
                    ${content.services && Array.isArray(content.services) ? `
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-top: 2rem;">
                            ${content.services.map(service => `
                                <div style="background: white; padding: 1.5rem; border-radius: 0.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                    <h3 style="color: var(--primary-color); margin-top: 0;">${service.name || 'Medical Service'}</h3>
                                    <p>${service.description || 'Professional medical service description.'}</p>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<p>Professional medical services tailored to your needs.</p>'}
                </section>

                <section class="section" data-section="contact">
                    <h2>Contact Information</h2>
                    ${content.contact ? `
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-top: 1.5rem;">
                            ${content.contact.address ? `<div><strong>Address:</strong><br>${content.contact.address}</div>` : ''}
                            ${content.contact.phone ? `<div><strong>Phone:</strong><br>${content.contact.phone}</div>` : ''}
                            ${content.contact.email ? `<div><strong>Email:</strong><br>${content.contact.email}</div>` : ''}
                        </div>
                    ` : '<p>Contact us to schedule an appointment.</p>'}
                </section>

                <footer class="footer" data-section="footer">
                    <p>${content.footer?.copyright || '© 2024 Medical Practice. All rights reserved.'}</p>
                    ${content.footer?.links ? `
                        <div style="margin-top: 1rem;">
                            ${content.footer.links.map(link => `<a href="#" style="color: white; margin: 0 1rem; text-decoration: none;">${link}</a>`).join('')}
                        </div>
                    ` : ''}
                </footer>

                <script>
                    // Section highlighting functionality
                    window.addEventListener('message', function(event) {
                        if (event.data.type === 'highlight-section') {
                            // Remove previous highlights
                            document.querySelectorAll('.highlight').forEach(el => {
                                el.classList.remove('highlight');
                            });
                            
                            // Add highlight to target section
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
    };

    // Handle iframe load events
    const handleIframeLoad = () => {
        setIframeLoading(false);
        setIframeError(null);
    };

    const handleIframeError = () => {
        setIframeLoading(false);
        setIframeError('Failed to load preview');
    };

    // Update iframe content when website data changes
    useEffect(() => {
        if (iframeRef.current && websiteData) {
            setIframeLoading(true);
            const html = generatePreviewHTML();
            const iframe = iframeRef.current;
            
            try {
                iframe.srcdoc = html;
            } catch (error) {
                console.error('Error setting iframe content:', error);
                setIframeError('Failed to render preview');
                setIframeLoading(false);
            }
        }
    }, [websiteData, generatePreviewHTML]);

    // Handle section highlighting
    useEffect(() => {
        if (iframeRef.current && highlightedSection) {
            try {
                iframeRef.current.contentWindow?.postMessage({
                    type: 'highlight-section',
                    section: highlightedSection
                }, '*');
            } catch (error) {
                console.error('Error highlighting section:', error);
            }
        }
    }, [highlightedSection]);

    // Handle view changes
    const handleViewChange = (view) => {
        setCurrentView(view);
        setHighlightedSection(null); // Clear highlights when changing view
    };

    // Handle zoom changes
    const handleZoomChange = (level) => {
        setZoomLevel(level);
    };

    // Handle fullscreen toggle
    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    // Handle refresh
    const handleRefresh = async () => {
        if (onRefresh) {
            onRefresh();
        } else if (websiteId) {
            // Refresh from backend
            setIframeLoading(true);
            try {
                const response = await apiService.generatePreview(websiteId, {
                    deviceType: currentView,
                    zoom: zoomLevel
                });
                
                if (response.success && iframeRef.current) {
                    const html = response.data.html || generatePreviewHTML();
                    iframeRef.current.srcdoc = html;
                }
            } catch (error) {
                console.error('Failed to refresh preview from backend:', error);
                setIframeError('Failed to refresh preview: ' + apiService.handleAPIError(error));
                setIframeLoading(false);
            }
        } else {
            // Reload iframe content locally
            if (iframeRef.current && websiteData) {
                setIframeLoading(true);
                const html = generatePreviewHTML();
                iframeRef.current.srcdoc = html;
            }
        }
    };

    // Get current view configuration
    const currentConfig = viewConfigs[currentView];

    if (isLoading) {
        return (
            <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Website Preview</h3>
                    <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </div>
                </div>
                <LoadingSkeleton className="h-96" />
            </div>
        );
    }

    if (error) {
        return (
            <div className={`bg-white rounded-xl border border-red-200 p-6 ${className}`}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Website Preview</h3>
                    <button
                        onClick={handleRefresh}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Retry preview"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <span className="text-red-800 font-medium">Preview Error</span>
                    </div>
                    <p className="text-red-700 mt-1">{error}</p>
                </div>
            </div>
        );
    }

    if (!websiteData) {
        return (
            <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
                <div className="text-center py-8">
                    <Monitor className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No website data available for preview</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className} ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
            {/* Preview Header */}
            <div className="border-b border-gray-200 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                    <div className="flex items-center space-x-2">
                        <Monitor className="w-5 h-5 text-gray-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Website Preview</h3>
                    </div>
                    
                    {/* Control buttons */}
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={handleRefresh}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                            title="Refresh preview"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                            onClick={toggleFullscreen}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                        >
                            <Maximize2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Device and zoom controls */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 space-y-3 sm:space-y-0">
                    {/* Device view toggles */}
                    <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                        {Object.entries(viewConfigs).map(([key, config]) => {
                            const IconComponent = config.icon;
                            return (
                                <button
                                    key={key}
                                    onClick={() => handleViewChange(key)}
                                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                        currentView === key
                                            ? 'bg-white text-blue-600 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    <IconComponent className="w-4 h-4" />
                                    <span className="hidden sm:inline">{config.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Zoom controls */}
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600 hidden sm:inline">Zoom:</span>
                        <select
                            value={zoomLevel}
                            onChange={(e) => handleZoomChange(Number(e.target.value))}
                            className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {zoomLevels.map(level => (
                                <option key={level} value={level}>{level}%</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Preview container */}
            <div 
                ref={containerRef}
                className="bg-gray-50 p-4 overflow-auto"
                style={{ 
                    height: isFullscreen ? 'calc(100vh - 200px)' : '600px'
                }}
            >
                <div 
                    className="mx-auto transition-all duration-300 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                    style={{ 
                        width: currentConfig.width,
                        maxWidth: currentConfig.maxWidth,
                        transform: `scale(${zoomLevel / 100})`,
                        transformOrigin: 'top center'
                    }}
                >
                    {/* Loading overlay */}
                    {iframeLoading && (
                        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10">
                            <div className="flex items-center space-x-2">
                                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-gray-600">Loading preview...</span>
                            </div>
                        </div>
                    )}

                    {/* Error overlay */}
                    {iframeError && (
                        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10">
                            <div className="text-center">
                                <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                                <p className="text-red-700">{iframeError}</p>
                                <button
                                    onClick={handleRefresh}
                                    className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                                >
                                    Retry
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Preview iframe */}
                    <iframe
                        ref={iframeRef}
                        className="w-full border-0"
                        style={{ 
                            height: isFullscreen ? '70vh' : '500px',
                            minHeight: '400px'
                        }}
                        onLoad={handleIframeLoad}
                        onError={handleIframeError}
                        sandbox="allow-scripts allow-same-origin"
                        title="Website Preview"
                    />
                </div>
            </div>

            {/* Section highlighting controls */}
            <div className="border-t border-gray-200 p-4">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-gray-600 font-medium">Highlight section:</span>
                    {['header', 'hero', 'about', 'services', 'contact', 'footer'].map(section => (
                        <button
                            key={section}
                            onClick={() => setHighlightedSection(highlightedSection === section ? null : section)}
                            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                                highlightedSection === section
                                    ? 'bg-yellow-100 border-yellow-300 text-yellow-800'
                                    : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {section.charAt(0).toUpperCase() + section.slice(1)}
                        </button>
                    ))}
                    {highlightedSection && (
                        <button
                            onClick={() => setHighlightedSection(null)}
                            className="px-3 py-1 text-xs rounded-full bg-red-100 border border-red-300 text-red-700 hover:bg-red-200 transition-colors ml-2"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
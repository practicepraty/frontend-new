import React from 'react';
import { Monitor, Tablet, Smartphone, ZoomIn, ZoomOut, RefreshCw, Maximize2, Minimize2, Eye } from 'lucide-react';

export default function PreviewControls({
    currentView = 'desktop',
    onViewChange,
    zoomLevel = 100,
    onZoomChange,
    isFullscreen = false,
    onFullscreenToggle,
    onRefresh,
    highlightedSection = null,
    onSectionHighlight,
    className = "",
    compact = false
}) {
    // Device view configurations
    const viewConfigs = {
        desktop: { 
            label: 'Desktop', 
            icon: Monitor, 
            description: '1200px+',
            shortLabel: 'Desktop'
        },
        tablet: { 
            label: 'Tablet', 
            icon: Tablet, 
            description: '768px-1199px',
            shortLabel: 'Tablet'
        },
        mobile: { 
            label: 'Mobile', 
            icon: Smartphone, 
            description: '320px-767px',
            shortLabel: 'Mobile'
        }
    };

    // Available zoom levels
    const zoomLevels = [50, 75, 100, 125, 150];

    // Available sections for highlighting
    const sections = [
        { id: 'header', label: 'Header' },
        { id: 'hero', label: 'Hero' },
        { id: 'about', label: 'About' },
        { id: 'services', label: 'Services' },
        { id: 'contact', label: 'Contact' },
        { id: 'footer', label: 'Footer' }
    ];

    // Handle zoom controls
    const handleZoomIn = () => {
        const currentIndex = zoomLevels.indexOf(zoomLevel);
        if (currentIndex < zoomLevels.length - 1) {
            onZoomChange?.(zoomLevels[currentIndex + 1]);
        }
    };

    const handleZoomOut = () => {
        const currentIndex = zoomLevels.indexOf(zoomLevel);
        if (currentIndex > 0) {
            onZoomChange?.(zoomLevels[currentIndex - 1]);
        }
    };

    const handleSectionToggle = (sectionId) => {
        const newSection = highlightedSection === sectionId ? null : sectionId;
        onSectionHighlight?.(newSection);
    };

    if (compact) {
        return (
            <div className={`flex items-center space-x-2 ${className}`}>
                {/* Compact device view toggle */}
                <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                    {Object.entries(viewConfigs).map(([key, config]) => {
                        const IconComponent = config.icon;
                        return (
                            <button
                                key={key}
                                onClick={() => onViewChange?.(key)}
                                className={`p-1.5 rounded-md transition-colors ${
                                    currentView === key
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                                title={`${config.label} view (${config.description})`}
                            >
                                <IconComponent className="w-4 h-4" />
                            </button>
                        );
                    })}
                </div>

                {/* Compact zoom controls */}
                <div className="flex items-center space-x-1">
                    <button
                        onClick={handleZoomOut}
                        disabled={zoomLevel <= zoomLevels[0]}
                        className="p-1.5 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Zoom out"
                    >
                        <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-gray-600 min-w-[3rem] text-center">{zoomLevel}%</span>
                    <button
                        onClick={handleZoomIn}
                        disabled={zoomLevel >= zoomLevels[zoomLevels.length - 1]}
                        className="p-1.5 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Zoom in"
                    >
                        <ZoomIn className="w-4 h-4" />
                    </button>
                </div>

                {/* Compact action buttons */}
                <div className="flex items-center space-x-1">
                    {onRefresh && (
                        <button
                            onClick={onRefresh}
                            className="p-1.5 text-gray-600 hover:text-gray-900 transition-colors"
                            title="Refresh preview"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    )}
                    {onFullscreenToggle && (
                        <button
                            onClick={onFullscreenToggle}
                            className="p-1.5 text-gray-600 hover:text-gray-900 transition-colors"
                            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                        >
                            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-lg border border-gray-200 p-4 space-y-4 ${className}`}>
            {/* Device View Controls */}
            <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                    <Monitor className="w-4 h-4 mr-2" />
                    Device View
                </h4>
                <div className="grid grid-cols-3 gap-2">
                    {Object.entries(viewConfigs).map(([key, config]) => {
                        const IconComponent = config.icon;
                        return (
                            <button
                                key={key}
                                onClick={() => onViewChange?.(key)}
                                className={`flex flex-col items-center space-y-2 p-3 rounded-lg border-2 transition-all ${
                                    currentView === key
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <IconComponent className="w-5 h-5" />
                                <div className="text-center">
                                    <div className="text-sm font-medium">{config.label}</div>
                                    <div className="text-xs text-gray-500">{config.description}</div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Zoom Controls */}
            <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                    <ZoomIn className="w-4 h-4 mr-2" />
                    Zoom Level
                </h4>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={handleZoomOut}
                        disabled={zoomLevel <= zoomLevels[0]}
                        className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Zoom out"
                    >
                        <ZoomOut className="w-4 h-4" />
                    </button>
                    
                    <div className="flex-1">
                        <input
                            type="range"
                            min={zoomLevels[0]}
                            max={zoomLevels[zoomLevels.length - 1]}
                            step="25"
                            value={zoomLevel}
                            onChange={(e) => onZoomChange?.(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            {zoomLevels.map(level => (
                                <span key={level}>{level}%</span>
                            ))}
                        </div>
                    </div>
                    
                    <button
                        onClick={handleZoomIn}
                        disabled={zoomLevel >= zoomLevels[zoomLevels.length - 1]}
                        className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Zoom in"
                    >
                        <ZoomIn className="w-4 h-4" />
                    </button>
                </div>
                
                <div className="text-center mt-2">
                    <select
                        value={zoomLevel}
                        onChange={(e) => onZoomChange?.(Number(e.target.value))}
                        className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        {zoomLevels.map(level => (
                            <option key={level} value={level}>{level}%</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Section Highlighting */}
            <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                    <Eye className="w-4 h-4 mr-2" />
                    Highlight Section
                </h4>
                <div className="grid grid-cols-2 gap-2">
                    {sections.map(section => (
                        <button
                            key={section.id}
                            onClick={() => handleSectionToggle(section.id)}
                            className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                                highlightedSection === section.id
                                    ? 'border-yellow-400 bg-yellow-50 text-yellow-800'
                                    : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                            }`}
                        >
                            {section.label}
                        </button>
                    ))}
                </div>
                
                {highlightedSection && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                        <button
                            onClick={() => onSectionHighlight?.(null)}
                            className="w-full px-3 py-2 text-sm bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                        >
                            Clear Highlighting
                        </button>
                    </div>
                )}
            </div>

            {/* Action Controls */}
            <div className="pt-3 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-2">
                    {onRefresh && (
                        <button
                            onClick={onRefresh}
                            className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            <span className="text-sm font-medium">Refresh</span>
                        </button>
                    )}
                    
                    {onFullscreenToggle && (
                        <button
                            onClick={onFullscreenToggle}
                            className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            {isFullscreen ? (
                                <>
                                    <Minimize2 className="w-4 h-4" />
                                    <span className="text-sm font-medium">Exit</span>
                                </>
                            ) : (
                                <>
                                    <Maximize2 className="w-4 h-4" />
                                    <span className="text-sm font-medium">Fullscreen</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
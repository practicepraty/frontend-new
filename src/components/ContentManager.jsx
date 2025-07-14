import React, { useState, useEffect, useCallback } from 'react';
import { Edit3, Save, X, RotateCcw, AlertCircle, CheckCircle, Eye, Settings, Plus, Trash2 } from 'lucide-react';
import EditableSection from './EditableSection.jsx';
import ContentRegeneration from './ContentRegeneration.jsx';
import contentService from '../services/contentService.js';
import apiService from '../utils/api.js';

export default function ContentManager({ 
    websiteData, 
    websiteId,
    onSave, 
    onPreview, 
    onContentChange,
    onSectionUpdate,
    className = "" 
}) {
    const [editableContent, setEditableContent] = useState(null);
    const [originalContent, setOriginalContent] = useState(null);
    const [activeSection, setActiveSection] = useState('hero');
    const [editingField, setEditingField] = useState(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [autoSaveStatus, setAutoSaveStatus] = useState('idle');
    const [showRegenerateModal, setShowRegenerateModal] = useState(false);
    const [regenerateTarget, setRegenerateTarget] = useState(null);
    const [expandedSections, setExpandedSections] = useState({
        hero: true,
        about: false,
        services: false,
        contact: false
    });

    // Initialize editable content from website data
    useEffect(() => {
        if (websiteData && !editableContent) {
            try {
                const transformedContent = contentService.transformToEditableContent(websiteData);
                setEditableContent(transformedContent);
                setOriginalContent(JSON.parse(JSON.stringify(transformedContent)));
            } catch (error) {
                console.error('Failed to transform website data:', error);
            }
        }
    }, [websiteData, editableContent]);

    // Auto-save functionality
    useEffect(() => {
        if (hasUnsavedChanges && editableContent) {
            setAutoSaveStatus('saving');
            contentService.autoSave(editableContent, 3000);
            
            const timer = setTimeout(() => {
                setAutoSaveStatus('saved');
                setTimeout(() => setAutoSaveStatus('idle'), 2000);
            }, 1000);
            
            return () => clearTimeout(timer);
        }
    }, [hasUnsavedChanges, editableContent]);

    // Validate content on changes
    useEffect(() => {
        if (editableContent) {
            const validation = contentService.validateContent(editableContent);
            setValidationErrors(validation.errors || {});
        }
    }, [editableContent]);

    // Handle content field updates
    const handleContentUpdate = useCallback(async (path, value) => {
        if (!editableContent) return;

        try {
            const updatedContent = contentService.updateContent(editableContent, path, value);
            setEditableContent(updatedContent);
            setHasUnsavedChanges(true);
            
            // Update backend if websiteId exists
            if (websiteId && onSectionUpdate) {
                // Extract section ID from path
                const pathParts = path.split('.');
                if (pathParts.length >= 3 && pathParts[0] === 'pages' && pathParts[1] === 'home') {
                    const sectionId = pathParts[2];
                    const sectionData = updatedContent.pages.home[sectionId];
                    
                    try {
                        await onSectionUpdate(sectionId, sectionData);
                    } catch (error) {
                        console.error(`Failed to update ${sectionId} in backend:`, error);
                        // Continue with local update even if backend fails
                    }
                }
            }
            
            // Notify parent of changes
            if (onContentChange) {
                onContentChange(updatedContent);
            }
        } catch (error) {
            console.error('Failed to update content:', error);
        }
    }, [editableContent, websiteId, onContentChange, onSectionUpdate]);

    // Handle service operations
    const handleAddService = useCallback(() => {
        if (!editableContent) return;

        const newService = {
            name: 'New Service',
            description: 'Service description',
            icon: 'medical'
        };

        try {
            const updatedContent = contentService.addService(editableContent, newService);
            setEditableContent(updatedContent);
            setHasUnsavedChanges(true);
            
            if (onContentChange) {
                onContentChange(updatedContent);
            }
        } catch (error) {
            console.error('Failed to add service:', error);
        }
    }, [editableContent, onContentChange]);

    const handleRemoveService = useCallback((serviceId) => {
        if (!editableContent) return;

        try {
            const updatedContent = contentService.removeService(editableContent, serviceId);
            setEditableContent(updatedContent);
            setHasUnsavedChanges(true);
            
            if (onContentChange) {
                onContentChange(updatedContent);
            }
        } catch (error) {
            console.error('Failed to remove service:', error);
        }
    }, [editableContent, onContentChange]);

    // Handle save
    const handleSave = async () => {
        if (!editableContent) return;

        setIsSaving(true);
        try {
            if (websiteId) {
                // Save to backend
                const websiteData = contentService.transformToWebsiteData(editableContent);
                await apiService.saveWebsite(websiteId, { content: websiteData });
            } else {
                // Fallback to content service
                await contentService.saveContent(editableContent);
            }
            
            setHasUnsavedChanges(false);
            setOriginalContent(JSON.parse(JSON.stringify(editableContent)));
            
            if (onSave) {
                onSave(editableContent);
            }
        } catch (error) {
            console.error('Failed to save content:', error);
            const errorMessage = websiteId ? apiService.handleAPIError(error) : error.message;
            alert('Failed to save content: ' + errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    // Handle discard changes
    const handleDiscardChanges = () => {
        if (originalContent) {
            setEditableContent(JSON.parse(JSON.stringify(originalContent)));
            setHasUnsavedChanges(false);
            setValidationErrors({});
        }
    };

    // Handle regeneration
    const handleRegenerateRequest = (sectionId, fieldPath) => {
        setRegenerateTarget({ sectionId, fieldPath, websiteId });
        setShowRegenerateModal(true);
    };

    // Handle section toggle
    const toggleSection = (sectionId) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    // Get field value by path
    const getFieldValue = (path) => {
        return contentService.getValueAtPath(editableContent, path);
    };

    // Get section data
    const getSectionData = (sectionId) => {
        if (!editableContent) return null;
        
        switch (sectionId) {
            case 'hero':
                return editableContent.pages?.home?.hero;
            case 'about':
                return editableContent.pages?.home?.about;
            case 'services':
                return editableContent.pages?.home?.services;
            case 'contact':
                return editableContent.pages?.home?.contact;
            case 'footer':
                return editableContent.pages?.home?.footer;
            case 'metadata':
                return editableContent.metadata;
            default:
                return null;
        }
    };

    // Count validation errors for section
    const getSectionErrorCount = (sectionId) => {
        return Object.keys(validationErrors).filter(path => 
            path.includes(sectionId)
        ).length;
    };

    if (!editableContent) {
        return (
            <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}>
            {/* Header */}
            <div className="border-b border-gray-200 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                            <Edit3 className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Content Manager</h2>
                            <p className="text-sm text-gray-600">
                                Edit your website content and customize the appearance
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        {/* Auto-save status */}
                        <div className="flex items-center space-x-2">
                            {autoSaveStatus === 'saving' && (
                                <div className="flex items-center space-x-2 text-blue-600">
                                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-sm">Auto-saving...</span>
                                </div>
                            )}
                            {autoSaveStatus === 'saved' && (
                                <div className="flex items-center space-x-2 text-green-600">
                                    <CheckCircle className="w-4 h-4" />
                                    <span className="text-sm">Auto-saved</span>
                                </div>
                            )}
                        </div>
                        
                        {/* Action buttons */}
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={onPreview}
                                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                <Eye className="w-4 h-4" />
                                <span>Preview</span>
                            </button>
                            
                            {hasUnsavedChanges && (
                                <button
                                    onClick={handleDiscardChanges}
                                    className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    <span>Discard</span>
                                </button>
                            )}
                            
                            <button
                                onClick={handleSave}
                                disabled={isSaving || Object.keys(validationErrors).length > 0}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                                    isSaving || Object.keys(validationErrors).length > 0
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                            >
                                {isSaving ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        <span>Save Changes</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content area */}
            <div className="flex">
                {/* Section navigation */}
                <div className="w-64 border-r border-gray-200 p-4">
                    <div className="space-y-2">
                        {[
                            { id: 'hero', label: 'Hero Section', icon: '🎯' },
                            { id: 'about', label: 'About Section', icon: '👨‍⚕️' },
                            { id: 'services', label: 'Services', icon: '🏥' },
                            { id: 'contact', label: 'Contact Info', icon: '📞' },
                            { id: 'footer', label: 'Footer', icon: '🔗' },
                            { id: 'metadata', label: 'SEO Settings', icon: '🔍' }
                        ].map(section => {
                            const errorCount = getSectionErrorCount(section.id);
                            const isActive = activeSection === section.id;
                            
                            return (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                                        isActive 
                                            ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                                            : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <span className="text-lg">{section.icon}</span>
                                        <span className="font-medium">{section.label}</span>
                                    </div>
                                    {errorCount > 0 && (
                                        <div className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-medium">
                                            {errorCount}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Main editing area */}
                <div className="flex-1 p-6">
                    {/* Validation errors summary */}
                    {Object.keys(validationErrors).length > 0 && (
                        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-2">
                                <AlertCircle className="w-5 h-5 text-red-600" />
                                <span className="font-medium text-red-800">
                                    Please fix validation errors ({Object.keys(validationErrors).length})
                                </span>
                            </div>
                            <ul className="text-sm text-red-700 space-y-1">
                                {Object.entries(validationErrors).map(([path, errors]) => (
                                    <li key={path} className="flex items-start space-x-2">
                                        <span className="font-medium">{path}:</span>
                                        <span>{Array.isArray(errors) ? errors.join(', ') : errors}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Section content */}
                    <div className="space-y-6">
                        {activeSection === 'services' && (
                            <div className="mb-6">
                                <button
                                    onClick={handleAddService}
                                    className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Add Service</span>
                                </button>
                            </div>
                        )}
                        
                        <EditableSection
                            sectionId={activeSection}
                            sectionData={getSectionData(activeSection)}
                            onFieldUpdate={handleContentUpdate}
                            onRegenerateRequest={handleRegenerateRequest}
                            onRemoveService={activeSection === 'services' ? handleRemoveService : null}
                            validationErrors={validationErrors}
                            editingField={editingField}
                            onEditingFieldChange={setEditingField}
                        />
                    </div>
                </div>
            </div>

            {/* Regeneration modal */}
            {showRegenerateModal && (
                <ContentRegeneration
                    target={regenerateTarget}
                    currentContent={getFieldValue(regenerateTarget?.fieldPath)}
                    onRegenerate={(newContent) => {
                        if (regenerateTarget?.fieldPath) {
                            handleContentUpdate(regenerateTarget.fieldPath, newContent);
                        }
                        setShowRegenerateModal(false);
                        setRegenerateTarget(null);
                    }}
                    onClose={() => {
                        setShowRegenerateModal(false);
                        setRegenerateTarget(null);
                    }}
                />
            )}
        </div>
    );
}
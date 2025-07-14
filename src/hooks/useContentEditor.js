import { useState, useEffect, useCallback, useRef } from 'react';
import contentService from '../services/contentService.js';

/**
 * Custom hook for managing content editing state
 * @param {Object} initialContent - Initial content data
 * @param {Object} options - Configuration options
 * @returns {Object} Content editing state and methods
 */
export default function useContentEditor(initialContent = null, options = {}) {
    const {
        autoSave = true,
        autoSaveDelay = 2000,
        maxHistorySize = 50,
        validateOnChange = true,
        trackChanges = true
    } = options;

    // State management
    const [content, setContent] = useState(initialContent);
    const [originalContent, setOriginalContent] = useState(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [validationWarnings, setValidationWarnings] = useState([]);
    const [editingField, setEditingField] = useState(null);
    const [changeHistory, setChangeHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [lastSavedAt, setLastSavedAt] = useState(null);
    const [autoSaveStatus, setAutoSaveStatus] = useState('idle'); // 'idle', 'saving', 'saved', 'error'

    // Refs for managing timeouts and preventing stale closures
    const autoSaveTimeout = useRef(null);
    const contentRef = useRef(content);
    const changeCallbackRef = useRef(null);

    // Update content ref when content changes
    useEffect(() => {
        contentRef.current = content;
    }, [content]);

    // Initialize content and set up original content
    useEffect(() => {
        if (initialContent && !originalContent) {
            setOriginalContent(JSON.parse(JSON.stringify(initialContent)));
            setContent(initialContent);
        }
    }, [initialContent, originalContent]);

    // Validate content when it changes
    useEffect(() => {
        if (validateOnChange && content) {
            validateContent();
        }
    }, [content, validateOnChange]);

    // Auto-save functionality
    useEffect(() => {
        if (autoSave && hasUnsavedChanges && content) {
            if (autoSaveTimeout.current) {
                clearTimeout(autoSaveTimeout.current);
            }

            autoSaveTimeout.current = setTimeout(() => {
                performAutoSave();
            }, autoSaveDelay);
        }

        return () => {
            if (autoSaveTimeout.current) {
                clearTimeout(autoSaveTimeout.current);
            }
        };
    }, [autoSave, hasUnsavedChanges, content, autoSaveDelay]);

    // Validate content
    const validateContent = useCallback(() => {
        if (!content) return;

        try {
            const validation = contentService.validateContent(content);
            setValidationErrors(validation.errors || {});
            setValidationWarnings(validation.warnings || []);
        } catch (error) {
            console.error('Content validation failed:', error);
            setValidationErrors({ general: ['Validation failed'] });
        }
    }, [content]);

    // Update content field
    const updateField = useCallback((fieldPath, newValue) => {
        if (!content) return;

        try {
            const updatedContent = contentService.updateContent(content, fieldPath, newValue);
            
            // Add to history if tracking changes
            if (trackChanges) {
                addToHistory({
                    action: 'update',
                    fieldPath,
                    oldValue: contentService.getValueAtPath(content, fieldPath),
                    newValue,
                    timestamp: new Date().toISOString()
                });
            }

            setContent(updatedContent);
            setHasUnsavedChanges(true);
            
            // Call change callback if set
            if (changeCallbackRef.current) {
                changeCallbackRef.current(updatedContent, fieldPath, newValue);
            }

        } catch (error) {
            console.error('Failed to update field:', error);
            setValidationErrors(prev => ({
                ...prev,
                [fieldPath]: ['Failed to update field']
            }));
        }
    }, [content, trackChanges]);

    // Batch update multiple fields
    const updateFields = useCallback((updates) => {
        if (!content || !Array.isArray(updates)) return;

        try {
            let updatedContent = content;
            const batchHistory = [];

            updates.forEach(({ fieldPath, newValue }) => {
                const oldValue = contentService.getValueAtPath(updatedContent, fieldPath);
                updatedContent = contentService.updateContent(updatedContent, fieldPath, newValue);
                
                if (trackChanges) {
                    batchHistory.push({
                        action: 'update',
                        fieldPath,
                        oldValue,
                        newValue,
                        timestamp: new Date().toISOString()
                    });
                }
            });

            // Add batch to history
            if (trackChanges && batchHistory.length > 0) {
                addToHistory({
                    action: 'batch_update',
                    changes: batchHistory,
                    timestamp: new Date().toISOString()
                });
            }

            setContent(updatedContent);
            setHasUnsavedChanges(true);
            
            // Call change callback
            if (changeCallbackRef.current) {
                changeCallbackRef.current(updatedContent, 'batch', updates);
            }

        } catch (error) {
            console.error('Failed to batch update fields:', error);
            setValidationErrors(prev => ({
                ...prev,
                batch: ['Failed to update multiple fields']
            }));
        }
    }, [content, trackChanges]);

    // Add service (for services section)
    const addService = useCallback((serviceData) => {
        if (!content) return;

        try {
            const updatedContent = contentService.addService(content, serviceData);
            
            if (trackChanges) {
                addToHistory({
                    action: 'add_service',
                    serviceData,
                    timestamp: new Date().toISOString()
                });
            }

            setContent(updatedContent);
            setHasUnsavedChanges(true);
            
            if (changeCallbackRef.current) {
                changeCallbackRef.current(updatedContent, 'add_service', serviceData);
            }

        } catch (error) {
            console.error('Failed to add service:', error);
            setValidationErrors(prev => ({
                ...prev,
                services: ['Failed to add service']
            }));
        }
    }, [content, trackChanges]);

    // Remove service
    const removeService = useCallback((serviceId) => {
        if (!content) return;

        try {
            const updatedContent = contentService.removeService(content, serviceId);
            
            if (trackChanges) {
                addToHistory({
                    action: 'remove_service',
                    serviceId,
                    timestamp: new Date().toISOString()
                });
            }

            setContent(updatedContent);
            setHasUnsavedChanges(true);
            
            if (changeCallbackRef.current) {
                changeCallbackRef.current(updatedContent, 'remove_service', serviceId);
            }

        } catch (error) {
            console.error('Failed to remove service:', error);
            setValidationErrors(prev => ({
                ...prev,
                services: ['Failed to remove service']
            }));
        }
    }, [content, trackChanges]);

    // Add to history
    const addToHistory = useCallback((historyItem) => {
        setChangeHistory(prev => {
            const newHistory = [...prev];
            
            // Remove any items after current index if we're not at the end
            if (historyIndex < newHistory.length - 1) {
                newHistory.splice(historyIndex + 1);
            }
            
            // Add new item
            newHistory.push(historyItem);
            
            // Limit history size
            if (newHistory.length > maxHistorySize) {
                newHistory.shift();
            }
            
            return newHistory;
        });
        
        setHistoryIndex(prev => Math.min(prev + 1, maxHistorySize - 1));
    }, [historyIndex, maxHistorySize]);

    // Undo last change
    const undo = useCallback(() => {
        if (historyIndex >= 0 && changeHistory.length > 0) {
            const historyItem = changeHistory[historyIndex];
            
            try {
                let updatedContent = content;
                
                // Reverse the action
                switch (historyItem.action) {
                    case 'update':
                        updatedContent = contentService.updateContent(
                            content, 
                            historyItem.fieldPath, 
                            historyItem.oldValue
                        );
                        break;
                    case 'add_service':
                        // Would need to track service ID to remove it
                        break;
                    case 'remove_service':
                        // Would need to restore service data
                        break;
                    case 'batch_update':
                        // Reverse each change in the batch
                        historyItem.changes.forEach(change => {
                            updatedContent = contentService.updateContent(
                                updatedContent,
                                change.fieldPath,
                                change.oldValue
                            );
                        });
                        break;
                }
                
                setContent(updatedContent);
                setHistoryIndex(prev => prev - 1);
                setHasUnsavedChanges(true);
                
                if (changeCallbackRef.current) {
                    changeCallbackRef.current(updatedContent, 'undo', historyItem);
                }

            } catch (error) {
                console.error('Failed to undo change:', error);
            }
        }
    }, [content, changeHistory, historyIndex]);

    // Redo last undone change
    const redo = useCallback(() => {
        if (historyIndex < changeHistory.length - 1) {
            const historyItem = changeHistory[historyIndex + 1];
            
            try {
                let updatedContent = content;
                
                // Reapply the action
                switch (historyItem.action) {
                    case 'update':
                        updatedContent = contentService.updateContent(
                            content,
                            historyItem.fieldPath,
                            historyItem.newValue
                        );
                        break;
                    case 'batch_update':
                        historyItem.changes.forEach(change => {
                            updatedContent = contentService.updateContent(
                                updatedContent,
                                change.fieldPath,
                                change.newValue
                            );
                        });
                        break;
                    // Handle other actions as needed
                }
                
                setContent(updatedContent);
                setHistoryIndex(prev => prev + 1);
                setHasUnsavedChanges(true);
                
                if (changeCallbackRef.current) {
                    changeCallbackRef.current(updatedContent, 'redo', historyItem);
                }

            } catch (error) {
                console.error('Failed to redo change:', error);
            }
        }
    }, [content, changeHistory, historyIndex]);

    // Save content
    const save = useCallback(async () => {
        if (!content || isSaving) return;

        setIsSaving(true);
        setAutoSaveStatus('saving');

        try {
            await contentService.saveContent(content);
            setHasUnsavedChanges(false);
            setOriginalContent(JSON.parse(JSON.stringify(content)));
            setLastSavedAt(new Date().toISOString());
            setAutoSaveStatus('saved');

            // Clear validation errors after successful save
            setValidationErrors({});

        } catch (error) {
            console.error('Failed to save content:', error);
            setAutoSaveStatus('error');
            setValidationErrors(prev => ({
                ...prev,
                save: ['Failed to save content']
            }));
        } finally {
            setIsSaving(false);
        }
    }, [content, isSaving]);

    // Auto-save
    const performAutoSave = useCallback(async () => {
        if (!content || isSaving) return;

        setAutoSaveStatus('saving');

        try {
            await contentService.saveContent(content);
            setHasUnsavedChanges(false);
            setOriginalContent(JSON.parse(JSON.stringify(content)));
            setLastSavedAt(new Date().toISOString());
            setAutoSaveStatus('saved');

            // Auto-save status returns to idle after a delay
            setTimeout(() => {
                setAutoSaveStatus('idle');
            }, 2000);

        } catch (error) {
            console.error('Auto-save failed:', error);
            setAutoSaveStatus('error');
            
            // Return to idle after error display
            setTimeout(() => {
                setAutoSaveStatus('idle');
            }, 3000);
        }
    }, [content, isSaving]);

    // Discard changes
    const discardChanges = useCallback(() => {
        if (originalContent) {
            setContent(JSON.parse(JSON.stringify(originalContent)));
            setHasUnsavedChanges(false);
            setValidationErrors({});
            setValidationWarnings([]);
            setChangeHistory([]);
            setHistoryIndex(-1);
            setAutoSaveStatus('idle');
            
            if (changeCallbackRef.current) {
                changeCallbackRef.current(originalContent, 'discard', null);
            }
        }
    }, [originalContent]);

    // Reset to initial state
    const reset = useCallback(() => {
        setContent(initialContent);
        setOriginalContent(initialContent ? JSON.parse(JSON.stringify(initialContent)) : null);
        setHasUnsavedChanges(false);
        setValidationErrors({});
        setValidationWarnings([]);
        setChangeHistory([]);
        setHistoryIndex(-1);
        setEditingField(null);
        setAutoSaveStatus('idle');
        
        if (changeCallbackRef.current) {
            changeCallbackRef.current(initialContent, 'reset', null);
        }
    }, [initialContent]);

    // Set change callback
    const setChangeCallback = useCallback((callback) => {
        changeCallbackRef.current = callback;
    }, []);

    // Get field value
    const getFieldValue = useCallback((fieldPath) => {
        return contentService.getValueAtPath(content, fieldPath);
    }, [content]);

    // Check if field has errors
    const hasFieldErrors = useCallback((fieldPath) => {
        return Object.keys(validationErrors).some(path => path.includes(fieldPath));
    }, [validationErrors]);

    // Get field errors
    const getFieldErrors = useCallback((fieldPath) => {
        return Object.keys(validationErrors)
            .filter(path => path.includes(fieldPath))
            .flatMap(path => validationErrors[path]);
    }, [validationErrors]);

    // Check if content is valid
    const isValid = Object.keys(validationErrors).length === 0;

    // Check if can undo/redo
    const canUndo = historyIndex >= 0;
    const canRedo = historyIndex < changeHistory.length - 1;

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (autoSaveTimeout.current) {
                clearTimeout(autoSaveTimeout.current);
            }
        };
    }, []);

    return {
        // State
        content,
        originalContent,
        hasUnsavedChanges,
        isLoading,
        isSaving,
        validationErrors,
        validationWarnings,
        editingField,
        changeHistory,
        lastSavedAt,
        autoSaveStatus,
        isValid,
        canUndo,
        canRedo,

        // Actions
        updateField,
        updateFields,
        addService,
        removeService,
        save,
        discardChanges,
        reset,
        undo,
        redo,
        validateContent,
        setEditingField,
        setChangeCallback,

        // Utilities
        getFieldValue,
        hasFieldErrors,
        getFieldErrors
    };
}
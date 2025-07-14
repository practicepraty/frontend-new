import React, { useState, useRef, useEffect } from 'react';
import { Edit3, Type, Image, Palette, Wand2, Check, X, Trash2, Plus, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import RichTextEditor from './RichTextEditor.jsx';
import ImageUploader from './ImageUploader.jsx';

export default function EditableSection({
    sectionId,
    sectionData,
    onFieldUpdate,
    onRegenerateRequest,
    onRemoveService,
    validationErrors = {},
    editingField,
    onEditingFieldChange
}) {
    const [expandedGroups, setExpandedGroups] = useState({});
    const [localValues, setLocalValues] = useState({});
    const [showColorPicker, setShowColorPicker] = useState(null);
    const [showImageUpload, setShowImageUpload] = useState(null);
    const [showRichTextEditor, setShowRichTextEditor] = useState(null);
    
    const inputRefs = useRef({});
    const colorPickerRef = useRef(null);

    // Update local values when section data changes
    useEffect(() => {
        if (sectionData) {
            const newLocalValues = {};
            extractFieldValues(sectionData, '', newLocalValues);
            setLocalValues(newLocalValues);
        }
    }, [sectionData]);

    // Extract field values recursively
    const extractFieldValues = (obj, prefix, result) => {
        if (!obj || typeof obj !== 'object') return;
        
        Object.keys(obj).forEach(key => {
            const value = obj[key];
            const path = prefix ? `${prefix}.${key}` : key;
            
            if (value && typeof value === 'object') {
                if (value.editable) {
                    const fieldValue = value.text || value.items || value.src || value.value || '';
                    result[path] = fieldValue;
                } else if (Array.isArray(value)) {
                    value.forEach((item, index) => {
                        if (item && typeof item === 'object') {
                            extractFieldValues(item, `${path}.${index}`, result);
                        }
                    });
                } else {
                    extractFieldValues(value, path, result);
                }
            }
        });
    };

    // Handle field value changes
    const handleFieldChange = (fieldPath, newValue) => {
        setLocalValues(prev => ({
            ...prev,
            [fieldPath]: newValue
        }));
        
        // Update content immediately for responsive editing
        const fullPath = `pages.home.${sectionId}.${fieldPath}`;
        onFieldUpdate(fullPath, newValue);
    };

    // Handle field blur (commit changes)
    const handleFieldBlur = (fieldPath) => {
        if (editingField === fieldPath) {
            onEditingFieldChange(null);
        }
    };

    // Handle field focus
    const handleFieldFocus = (fieldPath) => {
        onEditingFieldChange(fieldPath);
    };

    // Handle key press
    const handleKeyPress = (e, fieldPath) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleFieldBlur(fieldPath);
        }
        if (e.key === 'Escape') {
            handleFieldBlur(fieldPath);
        }
    };

    // Toggle group expansion
    const toggleGroup = (groupId) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupId]: !prev[groupId]
        }));
    };

    // Get field configuration
    const getFieldConfig = (obj, path) => {
        const pathParts = path.split('.');
        let current = obj;
        
        for (const part of pathParts) {
            if (current && typeof current === 'object' && current[part]) {
                current = current[part];
            } else {
                return null;
            }
        }
        
        return current && current.editable ? current : null;
    };

    // Get validation errors for field
    const getFieldErrors = (fieldPath) => {
        const fullPath = `pages.home.${sectionId}.${fieldPath}`;
        return validationErrors[fullPath] || [];
    };

    // Render field based on type
    const renderField = (fieldPath, fieldConfig, value) => {
        const errors = getFieldErrors(fieldPath);
        const hasErrors = errors.length > 0;
        const isEditing = editingField === fieldPath;
        
        const baseInputClass = `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
            hasErrors ? 'border-red-300' : 'border-gray-300'
        }`;

        switch (fieldConfig.type) {
            case 'text':
                return (
                    <div className="space-y-1">
                        <input
                            ref={ref => inputRefs.current[fieldPath] = ref}
                            type="text"
                            value={value || ''}
                            onChange={(e) => handleFieldChange(fieldPath, e.target.value)}
                            onFocus={() => handleFieldFocus(fieldPath)}
                            onBlur={() => handleFieldBlur(fieldPath)}
                            onKeyPress={(e) => handleKeyPress(e, fieldPath)}
                            className={baseInputClass}
                            placeholder={fieldConfig.placeholder || 'Enter text...'}
                            maxLength={fieldConfig.maxLength}
                        />
                        {fieldConfig.maxLength && (
                            <div className="text-xs text-gray-500 text-right">
                                {(value || '').length}/{fieldConfig.maxLength}
                            </div>
                        )}
                    </div>
                );

            case 'textarea':
                return (
                    <div className="space-y-1">
                        <textarea
                            ref={ref => inputRefs.current[fieldPath] = ref}
                            value={value || ''}
                            onChange={(e) => handleFieldChange(fieldPath, e.target.value)}
                            onFocus={() => handleFieldFocus(fieldPath)}
                            onBlur={() => handleFieldBlur(fieldPath)}
                            className={`${baseInputClass} min-h-[100px] resize-y`}
                            placeholder={fieldConfig.placeholder || 'Enter description...'}
                            maxLength={fieldConfig.maxLength}
                        />
                        {fieldConfig.maxLength && (
                            <div className="text-xs text-gray-500 text-right">
                                {(value || '').length}/{fieldConfig.maxLength}
                            </div>
                        )}
                    </div>
                );

            case 'rich-text':
                return (
                    <div className="space-y-2">
                        <button
                            onClick={() => setShowRichTextEditor(fieldPath)}
                            className="w-full p-3 border border-gray-300 rounded-lg text-left hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Type className="w-4 h-4 text-gray-600" />
                                    <span className="text-sm text-gray-700">
                                        {value ? 'Edit rich text content' : 'Add rich text content'}
                                    </span>
                                </div>
                                <Edit3 className="w-4 h-4 text-gray-400" />
                            </div>
                            {value && (
                                <div className="mt-2 p-2 bg-gray-100 rounded text-sm text-gray-600 line-clamp-3">
                                    {value.replace(/<[^>]*>/g, '').substring(0, 100)}...
                                </div>
                            )}
                        </button>
                    </div>
                );

            case 'email':
                return (
                    <input
                        ref={ref => inputRefs.current[fieldPath] = ref}
                        type="email"
                        value={value || ''}
                        onChange={(e) => handleFieldChange(fieldPath, e.target.value)}
                        onFocus={() => handleFieldFocus(fieldPath)}
                        onBlur={() => handleFieldBlur(fieldPath)}
                        className={baseInputClass}
                        placeholder="email@example.com"
                    />
                );

            case 'phone':
                return (
                    <input
                        ref={ref => inputRefs.current[fieldPath] = ref}
                        type="tel"
                        value={value || ''}
                        onChange={(e) => handleFieldChange(fieldPath, e.target.value)}
                        onFocus={() => handleFieldFocus(fieldPath)}
                        onBlur={() => handleFieldBlur(fieldPath)}
                        className={baseInputClass}
                        placeholder="(555) 123-4567"
                    />
                );

            case 'button':
                return (
                    <div className="space-y-2">
                        <input
                            ref={ref => inputRefs.current[fieldPath] = ref}
                            type="text"
                            value={value || ''}
                            onChange={(e) => handleFieldChange(fieldPath, e.target.value)}
                            onFocus={() => handleFieldFocus(fieldPath)}
                            onBlur={() => handleFieldBlur(fieldPath)}
                            className={baseInputClass}
                            placeholder="Button text"
                            maxLength={fieldConfig.maxLength}
                        />
                        <div className="flex items-center space-x-2">
                            <div className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
                                {value || 'Preview'}
                            </div>
                            <span className="text-xs text-gray-500">Button preview</span>
                        </div>
                    </div>
                );

            case 'image':
                return (
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setShowImageUpload(fieldPath)}
                                className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                <Image className="w-4 h-4" />
                                <span className="text-sm">
                                    {value ? 'Change Image' : 'Add Image'}
                                </span>
                            </button>
                            {value && (
                                <button
                                    onClick={() => handleFieldChange(fieldPath, null)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        {value && (
                            <div className="mt-2 p-2 bg-gray-100 rounded-lg">
                                <img 
                                    src={value} 
                                    alt="Preview" 
                                    className="w-full h-32 object-cover rounded"
                                />
                            </div>
                        )}
                    </div>
                );

            case 'list':
                const listItems = Array.isArray(value) ? value : [];
                return (
                    <div className="space-y-2">
                        {listItems.map((item, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={item || ''}
                                    onChange={(e) => {
                                        const newItems = [...listItems];
                                        newItems[index] = e.target.value;
                                        handleFieldChange(fieldPath, newItems);
                                    }}
                                    className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        hasErrors ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                    placeholder={`Item ${index + 1}`}
                                />
                                <button
                                    onClick={() => {
                                        const newItems = listItems.filter((_, i) => i !== index);
                                        handleFieldChange(fieldPath, newItems);
                                    }}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        {(!fieldConfig.maxItems || listItems.length < fieldConfig.maxItems) && (
                            <button
                                onClick={() => {
                                    const newItems = [...listItems, ''];
                                    handleFieldChange(fieldPath, newItems);
                                }}
                                className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="text-sm">Add Item</span>
                            </button>
                        )}
                    </div>
                );

            case 'icon':
                const iconOptions = ['medical', 'heart', 'stethoscope', 'pill', 'bandage', 'cross', 'user-md', 'hospital'];
                return (
                    <select
                        value={value || 'medical'}
                        onChange={(e) => handleFieldChange(fieldPath, e.target.value)}
                        className={baseInputClass}
                    >
                        {iconOptions.map(icon => (
                            <option key={icon} value={icon}>
                                {icon.charAt(0).toUpperCase() + icon.slice(1)}
                            </option>
                        ))}
                    </select>
                );

            default:
                return (
                    <input
                        ref={ref => inputRefs.current[fieldPath] = ref}
                        type="text"
                        value={value || ''}
                        onChange={(e) => handleFieldChange(fieldPath, e.target.value)}
                        onFocus={() => handleFieldFocus(fieldPath)}
                        onBlur={() => handleFieldBlur(fieldPath)}
                        className={baseInputClass}
                        placeholder="Enter value..."
                    />
                );
        }
    };

    // Render field group
    const renderFieldGroup = (groupTitle, fields, groupId) => {
        const isExpanded = expandedGroups[groupId] !== false;
        
        return (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                    onClick={() => toggleGroup(groupId)}
                    className="w-full px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between hover:bg-gray-100 transition-colors"
                >
                    <span className="font-medium text-gray-900">{groupTitle}</span>
                    {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-600" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-gray-600" />
                    )}
                </button>
                
                {isExpanded && (
                    <div className="p-4 space-y-4">
                        {fields.map(field => renderFieldItem(field))}
                    </div>
                )}
            </div>
        );
    };

    // Render individual field item
    const renderFieldItem = (field) => {
        const { path, label, config, value, required } = field;
        const errors = getFieldErrors(path);
        const hasErrors = errors.length > 0;
        
        return (
            <div key={path} className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                        <span>{label}</span>
                        {required && <span className="text-red-500">*</span>}
                    </label>
                    
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => onRegenerateRequest(sectionId, `pages.home.${sectionId}.${path}`)}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Regenerate with AI"
                        >
                            <Wand2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                
                {renderField(path, config, value)}
                
                {hasErrors && (
                    <div className="flex items-center space-x-2 text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">
                            {Array.isArray(errors) ? errors.join(', ') : errors}
                        </span>
                    </div>
                )}
            </div>
        );
    };

    // Prepare fields for rendering
    const prepareFields = (data, prefix = '') => {
        const fields = [];
        
        if (!data || typeof data !== 'object') return fields;
        
        Object.keys(data).forEach(key => {
            const value = data[key];
            const path = prefix ? `${prefix}.${key}` : key;
            
            if (value && typeof value === 'object') {
                if (value.editable) {
                    fields.push({
                        path,
                        label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
                        config: value,
                        value: localValues[path] || value.text || value.items || value.src || value.value || '',
                        required: value.required
                    });
                } else if (key === 'items' && Array.isArray(value)) {
                    value.forEach((item, index) => {
                        if (item && typeof item === 'object') {
                            fields.push(...prepareFields(item, `${path}.${index}`));
                        }
                    });
                } else {
                    fields.push(...prepareFields(value, path));
                }
            }
        });
        
        return fields;
    };

    if (!sectionData) {
        return (
            <div className="text-center py-8">
                <div className="text-gray-400 mb-2">No data available for this section</div>
                <button
                    onClick={() => onRegenerateRequest(sectionId, null)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors mx-auto"
                >
                    <Wand2 className="w-4 h-4" />
                    <span>Generate Content</span>
                </button>
            </div>
        );
    }

    const fields = prepareFields(sectionData);
    
    // Group fields by type for better organization
    const fieldGroups = {
        text: fields.filter(f => ['text', 'textarea', 'rich-text', 'button'].includes(f.config.type)),
        contact: fields.filter(f => ['email', 'phone'].includes(f.config.type)),
        media: fields.filter(f => ['image', 'icon'].includes(f.config.type)),
        lists: fields.filter(f => f.config.type === 'list'),
        other: fields.filter(f => !['text', 'textarea', 'rich-text', 'button', 'email', 'phone', 'image', 'icon', 'list'].includes(f.config.type))
    };

    return (
        <div className="space-y-6">
            {/* Section header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 capitalize">
                    {sectionId.replace(/([A-Z])/g, ' $1')} Section
                </h3>
                <button
                    onClick={() => onRegenerateRequest(sectionId, null)}
                    className="flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                    <Wand2 className="w-4 h-4" />
                    <span>Regenerate Section</span>
                </button>
            </div>

            {/* Field groups */}
            <div className="space-y-4">
                {fieldGroups.text.length > 0 && renderFieldGroup('Text Content', fieldGroups.text, 'text')}
                {fieldGroups.contact.length > 0 && renderFieldGroup('Contact Information', fieldGroups.contact, 'contact')}
                {fieldGroups.media.length > 0 && renderFieldGroup('Media & Icons', fieldGroups.media, 'media')}
                {fieldGroups.lists.length > 0 && renderFieldGroup('Lists & Navigation', fieldGroups.lists, 'lists')}
                {fieldGroups.other.length > 0 && renderFieldGroup('Other Settings', fieldGroups.other, 'other')}
            </div>

            {/* Special handling for services */}
            {sectionId === 'services' && sectionData.items && (
                <div className="space-y-4">
                    {sectionData.items.map((service, index) => (
                        <div key={service.id || index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="font-medium text-gray-900">Service {index + 1}</h4>
                                {onRemoveService && (
                                    <button
                                        onClick={() => onRemoveService(service.id || `service_${index}`)}
                                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            <div className="space-y-4">
                                {prepareFields(service, `items.${index}`).map(field => renderFieldItem(field))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Rich text editor modal */}
            {showRichTextEditor && (
                <RichTextEditor
                    initialContent={localValues[showRichTextEditor] || ''}
                    onSave={(content) => {
                        handleFieldChange(showRichTextEditor, content);
                        setShowRichTextEditor(null);
                    }}
                    onClose={() => setShowRichTextEditor(null)}
                />
            )}

            {/* Image upload modal */}
            {showImageUpload && (
                <ImageUploader
                    onUpload={(imageUrl) => {
                        handleFieldChange(showImageUpload, imageUrl);
                        setShowImageUpload(null);
                    }}
                    onClose={() => setShowImageUpload(null)}
                />
            )}
        </div>
    );
}
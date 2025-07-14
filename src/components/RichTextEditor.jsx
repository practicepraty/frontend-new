import React, { useState, useRef, useEffect } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, Link, Quote, AlignLeft, AlignCenter, AlignJustify, Save, X, Eye, Type } from 'lucide-react';

export default function RichTextEditor({ 
    initialContent = '', 
    onSave, 
    onClose,
    maxLength = 2000,
    placeholder = "Start typing your content..."
}) {
    const [content, setContent] = useState(initialContent);
    const [isPreview, setIsPreview] = useState(false);
    const [selectedText, setSelectedText] = useState('');
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [linkText, setLinkText] = useState('');
    const [characterCount, setCharacterCount] = useState(0);
    
    const editorRef = useRef(null);
    const textareaRef = useRef(null);
    const linkModalRef = useRef(null);

    useEffect(() => {
        // Count characters excluding HTML tags
        const textOnly = content.replace(/<[^>]*>/g, '');
        setCharacterCount(textOnly.length);
    }, [content]);

    // Handle text selection
    const handleTextSelection = () => {
        if (textareaRef.current) {
            const start = textareaRef.current.selectionStart;
            const end = textareaRef.current.selectionEnd;
            const selected = content.substring(start, end);
            setSelectedText(selected);
        }
    };

    // Apply formatting to selected text
    const applyFormatting = (tag, attributes = '') => {
        if (!textareaRef.current) return;
        
        const start = textareaRef.current.selectionStart;
        const end = textareaRef.current.selectionEnd;
        const selectedText = content.substring(start, end);
        
        if (selectedText) {
            const beforeText = content.substring(0, start);
            const afterText = content.substring(end);
            
            let formattedText;
            if (attributes) {
                formattedText = `<${tag} ${attributes}>${selectedText}</${tag}>`;
            } else {
                formattedText = `<${tag}>${selectedText}</${tag}>`;
            }
            
            const newContent = beforeText + formattedText + afterText;
            setContent(newContent);
            
            // Restore cursor position
            setTimeout(() => {
                const newEnd = start + formattedText.length;
                textareaRef.current.setSelectionRange(newEnd, newEnd);
                textareaRef.current.focus();
            }, 0);
        }
    };

    // Handle list formatting
    const applyListFormatting = (listType) => {
        if (!textareaRef.current) return;
        
        const start = textareaRef.current.selectionStart;
        const end = textareaRef.current.selectionEnd;
        const selectedText = content.substring(start, end);
        
        if (selectedText) {
            const beforeText = content.substring(0, start);
            const afterText = content.substring(end);
            
            // Split selected text into lines and wrap each in <li>
            const lines = selectedText.split('\n').filter(line => line.trim());
            const listItems = lines.map(line => `<li>${line.trim()}</li>`).join('\n');
            
            const tag = listType === 'ordered' ? 'ol' : 'ul';
            const formattedText = `<${tag}>\n${listItems}\n</${tag}>`;
            
            const newContent = beforeText + formattedText + afterText;
            setContent(newContent);
        }
    };

    // Handle link insertion
    const handleLinkInsertion = () => {
        if (!textareaRef.current) return;
        
        const start = textareaRef.current.selectionStart;
        const end = textareaRef.current.selectionEnd;
        const selectedText = content.substring(start, end);
        
        if (selectedText) {
            setLinkText(selectedText);
            setShowLinkModal(true);
        } else {
            setLinkText('');
            setShowLinkModal(true);
        }
    };

    // Insert link
    const insertLink = () => {
        if (!linkUrl || !linkText) return;
        
        const start = textareaRef.current.selectionStart;
        const end = textareaRef.current.selectionEnd;
        const beforeText = content.substring(0, start);
        const afterText = content.substring(end);
        
        const linkHtml = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
        const newContent = beforeText + linkHtml + afterText;
        
        setContent(newContent);
        setShowLinkModal(false);
        setLinkUrl('');
        setLinkText('');
        
        // Focus back to editor
        textareaRef.current.focus();
    };

    // Handle heading formatting
    const applyHeading = (level) => {
        if (!textareaRef.current) return;
        
        const start = textareaRef.current.selectionStart;
        const end = textareaRef.current.selectionEnd;
        const selectedText = content.substring(start, end);
        
        if (selectedText) {
            applyFormatting(`h${level}`);
        }
    };

    // Handle blockquote
    const applyBlockquote = () => {
        applyFormatting('blockquote');
    };

    // Handle alignment (simplified - adds CSS classes)
    const applyAlignment = (alignment) => {
        if (!textareaRef.current) return;
        
        const start = textareaRef.current.selectionStart;
        const end = textareaRef.current.selectionEnd;
        const selectedText = content.substring(start, end);
        
        if (selectedText) {
            let className = '';
            switch (alignment) {
                case 'left':
                    className = 'text-left';
                    break;
                case 'center':
                    className = 'text-center';
                    break;
                case 'right':
                    className = 'text-right';
                    break;
                case 'justify':
                    className = 'text-justify';
                    break;
            }
            
            applyFormatting('div', `class="${className}"`);
        }
    };

    // Clean up HTML for preview
    const cleanHtmlForPreview = (html) => {
        // Add basic styling classes for preview
        return html
            .replace(/<h1>/g, '<h1 class="text-2xl font-bold mb-4">')
            .replace(/<h2>/g, '<h2 class="text-xl font-bold mb-3">')
            .replace(/<h3>/g, '<h3 class="text-lg font-bold mb-2">')
            .replace(/<p>/g, '<p class="mb-2">')
            .replace(/<ul>/g, '<ul class="list-disc ml-6 mb-2">')
            .replace(/<ol>/g, '<ol class="list-decimal ml-6 mb-2">')
            .replace(/<li>/g, '<li class="mb-1">')
            .replace(/<blockquote>/g, '<blockquote class="border-l-4 border-gray-300 pl-4 italic mb-2">')
            .replace(/<a /g, '<a class="text-blue-600 hover:text-blue-800 underline" ');
    };

    // Handle save
    const handleSave = () => {
        // Basic validation
        if (characterCount > maxLength) {
            alert(`Content exceeds maximum length of ${maxLength} characters`);
            return;
        }
        
        // Clean up content before saving
        const cleanContent = content
            .replace(/\n\s*\n/g, '\n') // Remove extra line breaks
            .trim();
        
        onSave(cleanContent);
    };

    // Handle key shortcuts
    const handleKeyDown = (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'b':
                    e.preventDefault();
                    applyFormatting('strong');
                    break;
                case 'i':
                    e.preventDefault();
                    applyFormatting('em');
                    break;
                case 'u':
                    e.preventDefault();
                    applyFormatting('u');
                    break;
                case 's':
                    e.preventDefault();
                    handleSave();
                    break;
                case 'Enter':
                    e.preventDefault();
                    handleSave();
                    break;
                case 'Escape':
                    e.preventDefault();
                    onClose();
                    break;
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="border-b border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Type className="w-5 h-5 text-blue-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Rich Text Editor</h2>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setIsPreview(!isPreview)}
                                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                                    isPreview 
                                        ? 'bg-blue-100 text-blue-700' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                <Eye className="w-4 h-4" />
                                <span>{isPreview ? 'Edit' : 'Preview'}</span>
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                {!isPreview && (
                    <div className="border-b border-gray-200 p-3">
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Text formatting */}
                            <div className="flex items-center space-x-1 border-r border-gray-300 pr-2">
                                <button
                                    onClick={() => applyFormatting('strong')}
                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                    title="Bold (Ctrl+B)"
                                >
                                    <Bold className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => applyFormatting('em')}
                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                    title="Italic (Ctrl+I)"
                                >
                                    <Italic className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => applyFormatting('u')}
                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                    title="Underline (Ctrl+U)"
                                >
                                    <Underline className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Headings */}
                            <div className="flex items-center space-x-1 border-r border-gray-300 pr-2">
                                <select
                                    onChange={(e) => {
                                        if (e.target.value) {
                                            applyHeading(e.target.value);
                                            e.target.value = '';
                                        }
                                    }}
                                    className="text-sm border border-gray-300 rounded px-2 py-1"
                                    defaultValue=""
                                >
                                    <option value="">Heading</option>
                                    <option value="1">H1</option>
                                    <option value="2">H2</option>
                                    <option value="3">H3</option>
                                </select>
                            </div>

                            {/* Lists */}
                            <div className="flex items-center space-x-1 border-r border-gray-300 pr-2">
                                <button
                                    onClick={() => applyListFormatting('unordered')}
                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                    title="Bullet List"
                                >
                                    <List className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => applyListFormatting('ordered')}
                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                    title="Numbered List"
                                >
                                    <ListOrdered className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Special formatting */}
                            <div className="flex items-center space-x-1 border-r border-gray-300 pr-2">
                                <button
                                    onClick={handleLinkInsertion}
                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                    title="Insert Link"
                                >
                                    <Link className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={applyBlockquote}
                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                    title="Quote"
                                >
                                    <Quote className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Alignment */}
                            <div className="flex items-center space-x-1">
                                <button
                                    onClick={() => applyAlignment('left')}
                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                    title="Align Left"
                                >
                                    <AlignLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => applyAlignment('center')}
                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                    title="Align Center"
                                >
                                    <AlignCenter className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => applyAlignment('justify')}
                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                    title="Justify"
                                >
                                    <AlignJustify className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Editor/Preview area */}
                <div className="p-4 h-96 overflow-y-auto">
                    {isPreview ? (
                        <div 
                            className="prose prose-blue max-w-none"
                            dangerouslySetInnerHTML={{ __html: cleanHtmlForPreview(content) }}
                        />
                    ) : (
                        <textarea
                            ref={textareaRef}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            onSelect={handleTextSelection}
                            onKeyDown={handleKeyDown}
                            className="w-full h-full border border-gray-300 rounded-lg p-4 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            placeholder={placeholder}
                        />
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className={`text-sm ${
                                characterCount > maxLength ? 'text-red-600' : 'text-gray-600'
                            }`}>
                                {characterCount} / {maxLength} characters
                            </div>
                            <div className="text-xs text-gray-500">
                                Ctrl+S to save • Ctrl+B/I/U for formatting
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={characterCount > maxLength}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                                    characterCount > maxLength
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                            >
                                <Save className="w-4 h-4" />
                                <span>Save Content</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Link insertion modal */}
            {showLinkModal && (
                <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-60">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Insert Link</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Link Text
                                </label>
                                <input
                                    type="text"
                                    value={linkText}
                                    onChange={(e) => setLinkText(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Click here"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    URL
                                </label>
                                <input
                                    type="url"
                                    value={linkUrl}
                                    onChange={(e) => setLinkUrl(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="https://example.com"
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-end space-x-2 mt-6">
                            <button
                                onClick={() => setShowLinkModal(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={insertLink}
                                disabled={!linkUrl || !linkText}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    !linkUrl || !linkText
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                            >
                                Insert Link
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
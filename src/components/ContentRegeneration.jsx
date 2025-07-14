import React, { useState, useRef, useEffect } from 'react';
import { Wand2, X, RefreshCw, CheckCircle, AlertCircle, Copy, Sparkles, Zap, Target, Users, Search } from 'lucide-react';
import aiService from '../services/aiService.js';
import apiService from '../utils/api.js';

export default function ContentRegeneration({ 
    target, 
    currentContent, 
    onRegenerate, 
    onClose 
}) {
    const [regenerationPrompt, setRegenerationPrompt] = useState('');
    const [selectedTone, setSelectedTone] = useState('professional');
    const [selectedAction, setSelectedAction] = useState('improve');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedOptions, setGeneratedOptions] = useState([]);
    const [selectedOption, setSelectedOption] = useState(null);
    const [error, setError] = useState(null);
    const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
    const [customPrompt, setCustomPrompt] = useState('');
    const [targetAudience, setTargetAudience] = useState('patients');
    const [contentLength, setContentLength] = useState('same');
    const [includeKeywords, setIncludeKeywords] = useState('');

    const textareaRef = useRef(null);

    // Pre-defined regeneration actions
    const regenerationActions = [
        {
            id: 'improve',
            label: 'Improve Content',
            icon: Sparkles,
            description: 'Enhance clarity, flow, and engagement',
            prompt: 'Improve this content to make it more engaging and professional while maintaining the original meaning.'
        },
        {
            id: 'shorten',
            label: 'Make More Concise',
            icon: Zap,
            description: 'Reduce length while keeping key points',
            prompt: 'Make this content more concise and to the point while preserving all important information.'
        },
        {
            id: 'expand',
            label: 'Add More Detail',
            icon: Target,
            description: 'Provide more comprehensive information',
            prompt: 'Expand this content with more detailed information and examples to be more comprehensive.'
        },
        {
            id: 'medical',
            label: 'Emphasize Medical Expertise',
            icon: Users,
            description: 'Highlight professional credentials and expertise',
            prompt: 'Rewrite this content to emphasize medical expertise, professional credentials, and clinical experience.'
        },
        {
            id: 'seo',
            label: 'Optimize for SEO',
            icon: Search,
            description: 'Improve search engine visibility',
            prompt: 'Optimize this content for search engines while maintaining readability and including relevant medical keywords.'
        },
        {
            id: 'custom',
            label: 'Custom Request',
            icon: Wand2,
            description: 'Provide specific instructions',
            prompt: ''
        }
    ];

    // Tone options
    const toneOptions = [
        { id: 'professional', label: 'Professional', description: 'Formal and authoritative' },
        { id: 'friendly', label: 'Friendly', description: 'Warm and approachable' },
        { id: 'caring', label: 'Caring', description: 'Compassionate and empathetic' },
        { id: 'confident', label: 'Confident', description: 'Assured and trustworthy' },
        { id: 'educational', label: 'Educational', description: 'Informative and clear' }
    ];

    // Target audience options
    const audienceOptions = [
        { id: 'patients', label: 'Patients', description: 'General public seeking medical care' },
        { id: 'seniors', label: 'Senior Patients', description: 'Older adults and their families' },
        { id: 'families', label: 'Families', description: 'Parents and caregivers' },
        { id: 'professionals', label: 'Medical Professionals', description: 'Other healthcare providers' },
        { id: 'specialists', label: 'Specialists', description: 'Specialists in your field' }
    ];

    // Content length options
    const lengthOptions = [
        { id: 'shorter', label: 'Shorter', description: 'Reduce by 20-30%' },
        { id: 'same', label: 'Similar Length', description: 'Keep roughly the same' },
        { id: 'longer', label: 'Longer', description: 'Expand by 20-30%' },
        { id: 'much_longer', label: 'Much Longer', description: 'Expand significantly' }
    ];

    // Build regeneration prompt
    const buildRegenerationPrompt = () => {
        const selectedActionObj = regenerationActions.find(a => a.id === selectedAction);
        const selectedToneObj = toneOptions.find(t => t.id === selectedTone);
        const selectedAudienceObj = audienceOptions.find(a => a.id === targetAudience);
        const selectedLengthObj = lengthOptions.find(l => l.id === contentLength);

        let prompt = '';

        if (selectedAction === 'custom' && customPrompt) {
            prompt = customPrompt;
        } else if (selectedActionObj) {
            prompt = selectedActionObj.prompt;
        }

        // Add tone instruction
        if (selectedToneObj) {
            prompt += ` Use a ${selectedToneObj.label.toLowerCase()} tone that is ${selectedToneObj.description.toLowerCase()}.`;
        }

        // Add audience instruction
        if (selectedAudienceObj) {
            prompt += ` Target this content for ${selectedAudienceObj.description.toLowerCase()}.`;
        }

        // Add length instruction
        if (selectedLengthObj && contentLength !== 'same') {
            prompt += ` Make the content ${selectedLengthObj.description.toLowerCase()}.`;
        }

        // Add keywords if specified
        if (includeKeywords) {
            prompt += ` Include these keywords naturally: ${includeKeywords}.`;
        }

        // Add medical context
        prompt += ' This is for a medical practice website, so maintain medical accuracy and professionalism.';

        return prompt;
    };

    // Generate content options
    const generateContent = async () => {
        if (!currentContent) return;

        setIsGenerating(true);
        setError(null);
        setGeneratedOptions([]);

        try {
            const prompt = buildRegenerationPrompt();
            
            if (target?.websiteId) {
                // Use backend API for regeneration
                const options = {
                    prompt,
                    tone: selectedTone,
                    audience: targetAudience,
                    length: contentLength,
                    keywords: includeKeywords,
                    currentContent,
                    variationCount: 3
                };

                const result = await apiService.regenerateContent(target.websiteId, target.sectionId, options);
                
                if (result.success && result.data.variations) {
                    const formattedOptions = result.data.variations.map((variation, index) => ({
                        id: index + 1,
                        content: variation.content,
                        score: variation.score || 0.8,
                        improvements: variation.improvements || []
                    }));
                    setGeneratedOptions(formattedOptions);
                } else {
                    throw new Error('No content variations were generated successfully');
                }
            } else {
                // Fallback to local AI service
                const promises = Array.from({ length: 3 }, (_, index) => 
                    aiService.regenerateContent(target?.sectionId, currentContent, prompt, {
                        tone: selectedTone,
                        audience: targetAudience,
                        length: contentLength,
                        keywords: includeKeywords,
                        variation: index + 1
                    })
                );

                const results = await Promise.allSettled(promises);
                const options = results
                    .filter(result => result.status === 'fulfilled' && result.value?.success)
                    .map((result, index) => ({
                        id: index + 1,
                        content: result.value.data.content,
                        score: result.value.data.score || 0.8,
                        improvements: result.value.data.improvements || []
                    }));

                if (options.length === 0) {
                    throw new Error('No content variations were generated successfully');
                }

                setGeneratedOptions(options);
            }
        } catch (error) {
            console.error('Content regeneration failed:', error);
            const errorMessage = target?.websiteId 
                ? apiService.handleAPIError(error) 
                : (error.message || 'Failed to generate content. Please try again.');
            setError(errorMessage);
        } finally {
            setIsGenerating(false);
        }
    };

    // Handle option selection
    const handleOptionSelect = (option) => {
        setSelectedOption(option);
    };

    // Handle regeneration
    const handleRegenerate = () => {
        if (selectedOption) {
            onRegenerate(selectedOption.content);
        }
    };

    // Copy to clipboard
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            // Could show a toast notification here
        });
    };

    // Get section name for display
    const getSectionDisplayName = () => {
        if (!target?.sectionId) return 'Content';
        return target.sectionId.charAt(0).toUpperCase() + target.sectionId.slice(1);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="border-b border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="bg-purple-100 p-2 rounded-lg">
                                <Wand2 className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">AI Content Regeneration</h2>
                                <p className="text-sm text-gray-600">
                                    Improve your {getSectionDisplayName()} content with AI assistance
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex h-full">
                    {/* Left sidebar - Options */}
                    <div className="w-80 border-r border-gray-200 p-6 overflow-y-auto">
                        <div className="space-y-6">
                            {/* Current content */}
                            <div>
                                <h3 className="font-medium text-gray-900 mb-2">Current Content</h3>
                                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 max-h-32 overflow-y-auto">
                                    {currentContent || 'No content provided'}
                                </div>
                            </div>

                            {/* Regeneration action */}
                            <div>
                                <h3 className="font-medium text-gray-900 mb-3">What would you like to do?</h3>
                                <div className="space-y-2">
                                    {regenerationActions.map(action => (
                                        <button
                                            key={action.id}
                                            onClick={() => setSelectedAction(action.id)}
                                            className={`w-full text-left p-3 rounded-lg border transition-colors ${
                                                selectedAction === action.id
                                                    ? 'border-purple-300 bg-purple-50'
                                                    : 'border-gray-200 hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <action.icon className="w-4 h-4 text-purple-600" />
                                                <div>
                                                    <div className="font-medium text-sm">{action.label}</div>
                                                    <div className="text-xs text-gray-600">{action.description}</div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Custom prompt */}
                            {selectedAction === 'custom' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Custom Instructions
                                    </label>
                                    <textarea
                                        value={customPrompt}
                                        onChange={(e) => setCustomPrompt(e.target.value)}
                                        className="w-full h-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                        placeholder="Describe what you want to do with this content..."
                                    />
                                </div>
                            )}

                            {/* Tone selection */}
                            <div>
                                <h3 className="font-medium text-gray-900 mb-2">Tone</h3>
                                <select
                                    value={selectedTone}
                                    onChange={(e) => setSelectedTone(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    {toneOptions.map(tone => (
                                        <option key={tone.id} value={tone.id}>
                                            {tone.label} - {tone.description}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Advanced options toggle */}
                            <div>
                                <button
                                    onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                                    className="flex items-center space-x-2 text-sm text-purple-600 hover:text-purple-700"
                                >
                                    <span>Advanced Options</span>
                                    <RefreshCw className={`w-4 h-4 transition-transform ${showAdvancedOptions ? 'rotate-180' : ''}`} />
                                </button>
                            </div>

                            {/* Advanced options */}
                            {showAdvancedOptions && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Target Audience
                                        </label>
                                        <select
                                            value={targetAudience}
                                            onChange={(e) => setTargetAudience(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        >
                                            {audienceOptions.map(audience => (
                                                <option key={audience.id} value={audience.id}>
                                                    {audience.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Content Length
                                        </label>
                                        <select
                                            value={contentLength}
                                            onChange={(e) => setContentLength(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        >
                                            {lengthOptions.map(length => (
                                                <option key={length.id} value={length.id}>
                                                    {length.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Keywords to Include
                                        </label>
                                        <input
                                            type="text"
                                            value={includeKeywords}
                                            onChange={(e) => setIncludeKeywords(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="cardiology, heart health, treatment"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Separate multiple keywords with commas
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Generate button */}
                            <button
                                onClick={generateContent}
                                disabled={isGenerating || (selectedAction === 'custom' && !customPrompt)}
                                className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-colors ${
                                    isGenerating || (selectedAction === 'custom' && !customPrompt)
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-purple-600 text-white hover:bg-purple-700'
                                }`}
                            >
                                {isGenerating ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Generating...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4" />
                                        <span>Generate Content</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Right side - Generated options */}
                    <div className="flex-1 p-6 overflow-y-auto">
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                <div className="flex items-center space-x-2">
                                    <AlertCircle className="w-5 h-5 text-red-600" />
                                    <span className="font-medium text-red-800">Generation Error</span>
                                </div>
                                <p className="text-red-700 mt-1">{error}</p>
                            </div>
                        )}

                        {generatedOptions.length === 0 && !isGenerating && !error && (
                            <div className="text-center py-12">
                                <Wand2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Generate</h3>
                                <p className="text-gray-600">
                                    Configure your options on the left and click "Generate Content" to see AI-powered improvements.
                                </p>
                            </div>
                        )}

                        {isGenerating && (
                            <div className="text-center py-12">
                                <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Generating Content</h3>
                                <p className="text-gray-600">
                                    AI is analyzing your content and creating improved versions...
                                </p>
                            </div>
                        )}

                        {generatedOptions.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-medium text-gray-900">Generated Options</h3>
                                    <p className="text-sm text-gray-600">
                                        Select the option you prefer
                                    </p>
                                </div>

                                {generatedOptions.map((option, index) => (
                                    <div
                                        key={option.id}
                                        className={`border rounded-lg p-4 transition-colors cursor-pointer ${
                                            selectedOption?.id === option.id
                                                ? 'border-purple-300 bg-purple-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                        onClick={() => handleOptionSelect(option)}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center space-x-2">
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                                                    selectedOption?.id === option.id
                                                        ? 'bg-purple-600 text-white'
                                                        : 'bg-gray-200 text-gray-600'
                                                }`}>
                                                    {index + 1}
                                                </div>
                                                <span className="font-medium text-gray-900">Option {index + 1}</span>
                                                {option.score && (
                                                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                                        {Math.round(option.score * 100)}% match
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    copyToClipboard(option.content);
                                                }}
                                                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                                title="Copy to clipboard"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        </div>
                                        
                                        <div className="text-gray-700 text-sm leading-relaxed mb-3">
                                            {option.content}
                                        </div>
                                        
                                        {option.improvements && option.improvements.length > 0 && (
                                            <div className="border-t border-gray-200 pt-3">
                                                <h4 className="text-xs font-medium text-gray-600 mb-2">Improvements:</h4>
                                                <ul className="text-xs text-gray-500 space-y-1">
                                                    {option.improvements.map((improvement, i) => (
                                                        <li key={i} className="flex items-center space-x-2">
                                                            <CheckCircle className="w-3 h-3 text-green-500" />
                                                            <span>{improvement}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            {selectedOption ? `Option ${selectedOption.id} selected` : 'No option selected'}
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRegenerate}
                                disabled={!selectedOption}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                                    !selectedOption
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-purple-600 text-white hover:bg-purple-700'
                                }`}
                            >
                                <CheckCircle className="w-4 h-4" />
                                <span>Use This Content</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
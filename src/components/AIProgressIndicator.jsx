import React from 'react';
import { CheckCircle, Circle, AlertCircle, Clock, Mic, FileText, Brain, Sparkles, Globe, Loader2, X } from 'lucide-react';
import ErrorDisplay from './ErrorDisplay';

const AIProgressIndicator = ({ 
    progressData, 
    isProcessing, 
    error, 
    onRetry,
    onCancel,
    canCancel = false,
    className = "" 
}) => {
    if (!isProcessing && !error) return null;

    const { 
        currentStep = 0, 
        totalSteps = 0, 
        stepId = '', 
        stepLabel = '', 
        status = 'processing', 
        progress = 0, 
        inputType = 'audio' 
    } = progressData || {};

    // Defensive programming - ensure we have valid values
    const safeCurrentStep = Math.max(0, Math.min(currentStep || 0, totalSteps - 1));
    const safeTotalSteps = Math.max(1, totalSteps || 1);
    const safeProgress = Math.max(0, Math.min(progress || 0, 100));
    const safeStepLabel = stepLabel || 'Processing...';
    const safeStatus = status || 'processing';

    // Get icon for input type
    const getInputTypeIcon = () => {
        switch (inputType) {
            case 'audio': return <Mic className="w-5 h-5" />;
            case 'text': return <FileText className="w-5 h-5" />;
            default: return <Brain className="w-5 h-5" />;
        }
    };

    // Get icon for each step
    const getStepIcon = (stepId) => {
        const iconMap = {
            upload: <Mic className="w-4 h-4" />,
            transcribe: <FileText className="w-4 h-4" />,
            process_text: <Brain className="w-4 h-4" />,
            detect_specialty: <Sparkles className="w-4 h-4" />,
            generate_content: <Brain className="w-4 h-4" />,
            build_structure: <Globe className="w-4 h-4" />
        };
        return iconMap[stepId] || <Circle className="w-4 h-4" />;
    };

    // Get step status
    const getStepStatus = (stepIndex) => {
        if (stepIndex < safeCurrentStep) return 'completed';
        if (stepIndex === safeCurrentStep) return safeStatus;
        return 'pending';
    };

    // Get estimated time remaining
    const getEstimatedTimeRemaining = () => {
        const remainingSteps = safeTotalSteps - safeCurrentStep;
        const avgTimePerStep = 15; // seconds
        const estimatedSeconds = remainingSteps * avgTimePerStep;
        
        if (estimatedSeconds < 60) {
            return `~${estimatedSeconds}s remaining`;
        } else {
            const minutes = Math.ceil(estimatedSeconds / 60);
            return `~${minutes}m remaining`;
        }
    };

    // Steps configuration for different input types
    const getStepsConfig = () => {
        const audioSteps = [
            { id: 'upload', label: 'Uploading audio file', icon: <Mic className="w-4 h-4" /> },
            { id: 'transcribe', label: 'Transcribing with Assembly AI', icon: <FileText className="w-4 h-4" /> },
            { id: 'process_text', label: 'Processing transcription', icon: <Brain className="w-4 h-4" /> },
            { id: 'detect_specialty', label: 'Detecting medical specialty', icon: <Sparkles className="w-4 h-4" /> },
            { id: 'generate_content', label: 'Generating content', icon: <Brain className="w-4 h-4" /> },
            { id: 'build_structure', label: 'Building website structure', icon: <Globe className="w-4 h-4" /> }
        ];

        const textSteps = [
            { id: 'process_text', label: 'Processing your text', icon: <Brain className="w-4 h-4" /> },
            { id: 'detect_specialty', label: 'Detecting medical specialty', icon: <Sparkles className="w-4 h-4" /> },
            { id: 'generate_content', label: 'Generating content', icon: <Brain className="w-4 h-4" /> },
            { id: 'build_structure', label: 'Building website structure', icon: <Globe className="w-4 h-4" /> }
        ];

        return inputType === 'audio' ? audioSteps : textSteps;
    };

    const stepsConfig = getStepsConfig();

    if (error) {
        return (
            <div className={`bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden ${className}`}>
                {/* Error Header */}
                <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
                    <div className="flex items-center justify-between text-white">
                        <div className="flex items-center space-x-3">
                            <AlertCircle className="w-6 h-6" />
                            <span className="font-semibold">Processing Failed</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm opacity-90">
                            {getInputTypeIcon()}
                            <span className="capitalize">{inputType} Processing</span>
                        </div>
                    </div>
                </div>

                {/* Enhanced Error Display */}
                <div className="p-6">
                    <ErrorDisplay 
                        error={error}
                        onRetry={onRetry}
                        onCancel={onCancel}
                        showRetry={error?.retryable !== false}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-2xl shadow-xl border border-blue-200 overflow-hidden ${className}`}>
            {/* Progress Header */}
            <div className="bg-gradient-to-r from-blue-600 to-green-600 px-4 sm:px-6 py-3 sm:py-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-white space-y-2 sm:space-y-0">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                        <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                        <span className="text-sm sm:text-base font-semibold">AI Processing</span>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2 text-xs sm:text-sm opacity-90">
                            {getInputTypeIcon()}
                            <span className="capitalize">{inputType} Input</span>
                        </div>
                        {canCancel && onCancel && (
                            <button
                                onClick={onCancel}
                                className="p-1 hover:bg-white/20 rounded transition-colors"
                                title="Cancel processing"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Current Step Progress */}
            <div className="bg-blue-50 px-4 sm:px-6 py-3 sm:py-4 border-b border-blue-100">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                            {getStepIcon(stepId)}
                            <span className="font-medium text-blue-900">{safeStepLabel}</span>
                        </div>
                    </div>
                    <div className="text-sm text-blue-700">
                        Step {safeCurrentStep + 1} of {safeTotalSteps}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                    <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${safeProgress}%` }}
                    />
                </div>

                <div className="flex justify-between items-center text-xs text-blue-600">
                    <span>{safeProgress}% complete</span>
                    <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{getEstimatedTimeRemaining()}</span>
                    </div>
                </div>
            </div>

            {/* Steps List */}
            <div className="p-4 sm:p-6">
                <div className="space-y-3">
                    {stepsConfig.map((step, index) => {
                        const stepStatus = getStepStatus(index);
                        const isCurrentStep = index === safeCurrentStep;
                        
                        return (
                            <div 
                                key={step.id}
                                className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                                    isCurrentStep 
                                        ? 'bg-blue-50 border border-blue-200' 
                                        : stepStatus === 'completed'
                                        ? 'bg-green-50 border border-green-200'
                                        : 'bg-gray-50 border border-gray-200'
                                }`}
                            >
                                {/* Step Icon/Status */}
                                <div className="flex-shrink-0">
                                    {stepStatus === 'completed' ? (
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                    ) : stepStatus === 'error' ? (
                                        <AlertCircle className="w-5 h-5 text-red-600" />
                                    ) : isCurrentStep ? (
                                        <div className="relative">
                                            <Circle className="w-5 h-5 text-blue-600" />
                                            <Loader2 className="w-3 h-3 text-blue-600 animate-spin absolute top-1 left-1" />
                                        </div>
                                    ) : (
                                        <Circle className="w-5 h-5 text-gray-400" />
                                    )}
                                </div>

                                {/* Step Content */}
                                <div className="flex-1 flex items-center space-x-2">
                                    {step.icon}
                                    <span className={`font-medium ${
                                        stepStatus === 'completed' 
                                            ? 'text-green-700' 
                                            : isCurrentStep 
                                            ? 'text-blue-700'
                                            : stepStatus === 'error'
                                            ? 'text-red-700'
                                            : 'text-gray-500'
                                    }`}>
                                        {step.label}
                                    </span>
                                </div>

                                {/* Step Status Indicator */}
                                <div className="flex-shrink-0">
                                    {stepStatus === 'completed' && (
                                        <span className="text-xs text-green-600 font-medium">✓ Done</span>
                                    )}
                                    {isCurrentStep && stepStatus === 'processing' && (
                                        <span className="text-xs text-blue-600 font-medium">Processing...</span>
                                    )}
                                    {stepStatus === 'error' && (
                                        <span className="text-xs text-red-600 font-medium">Error</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Overall Progress */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Overall Progress</span>
                        <span>{Math.round((safeCurrentStep / safeTotalSteps) * 100)}% Complete</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                            className="bg-gradient-to-r from-blue-600 to-green-600 h-2 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${(safeCurrentStep / safeTotalSteps) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                <div className="flex items-center justify-center text-xs text-gray-500 space-x-2">
                    <span>🔒 Secure processing</span>
                    <span>•</span>
                    <span>🤖 AI-powered generation</span>
                    <span>•</span>
                    <span>⚡ Real-time updates</span>
                </div>
            </div>
        </div>
    );
};

export default AIProgressIndicator;
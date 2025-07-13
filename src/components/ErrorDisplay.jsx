import React from 'react';
import { AlertCircle, RefreshCw, Info, WifiOff, Upload, Settings, FileX } from 'lucide-react';

const ErrorDisplay = ({ error, onRetry, onCancel, showRetry = true }) => {
    if (!error) return null;

    const getErrorIcon = (category, severity) => {
        const iconClass = `w-5 h-5 ${severity === 'error' ? 'text-red-600' : 'text-yellow-600'}`;
        
        switch (category) {
            case 'network':
                return <WifiOff className={iconClass} />;
            case 'upload':
                return <Upload className={iconClass} />;
            case 'file_format':
            case 'file_size':
                return <FileX className={iconClass} />;
            case 'server':
            case 'processing':
                return <Settings className={iconClass} />;
            case 'transcription':
                return <Info className={iconClass} />;
            default:
                return <AlertCircle className={iconClass} />;
        }
    };

    const getErrorColor = (category, severity) => {
        if (severity === 'warning') return 'yellow';
        
        switch (category) {
            case 'network':
                return 'blue';
            case 'file_format':
            case 'file_size':
            case 'validation':
                return 'orange';
            case 'server':
                return 'purple';
            default:
                return 'red';
        }
    };

    const getStageDisplay = (stage) => {
        const stageNames = {
            upload: 'File Upload',
            transcribe: 'Audio Transcription',
            process_text: 'Text Processing',
            detect_specialty: 'Specialty Detection',
            generate_content: 'Content Generation',
            build_structure: 'Website Building'
        };
        return stageNames[stage] || 'Processing';
    };

    const color = getErrorColor(error.category, error.severity);
    const bgColor = `bg-${color}-50`;
    const borderColor = `border-${color}-200`;
    const textColor = `text-${color}-800`;
    const buttonColor = `bg-${color}-600 hover:bg-${color}-700`;

    return (
        <div className={`${bgColor} border ${borderColor} rounded-lg p-4 space-y-4`}>
            {/* Error Header */}
            <div className="flex items-start space-x-3">
                {getErrorIcon(error.category, error.severity)}
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <h3 className={`text-sm font-medium ${textColor}`}>
                            {error.severity === 'error' ? 'Error' : 'Warning'}
                            {error.stage && error.stage !== 'unknown' && (
                                <span className="ml-2 text-xs opacity-75">
                                    • {getStageDisplay(error.stage)}
                                </span>
                            )}
                        </h3>
                        {error.code && (
                            <span className={`text-xs ${textColor} opacity-60`}>
                                Code: {error.code}
                            </span>
                        )}
                    </div>
                    
                    {/* Main Error Message */}
                    <p className={`text-sm ${textColor} mt-1`}>
                        {error.message}
                    </p>
                    
                    {/* User Guidance */}
                    {error.guidance && (
                        <div className={`mt-2 p-2 bg-white rounded border border-${color}-100`}>
                            <p className={`text-xs ${textColor}`}>
                                <strong>What to do:</strong> {error.guidance}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Technical Details (Collapsible) */}
            {error.technicalMessage && error.technicalMessage !== error.message && (
                <details className="mt-3">
                    <summary className={`text-xs ${textColor} cursor-pointer hover:underline`}>
                        Technical Details
                    </summary>
                    <div className={`mt-1 p-2 bg-gray-100 rounded text-xs text-gray-700 font-mono`}>
                        {error.technicalMessage}
                    </div>
                </details>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2">
                    {showRetry && error.retryable && onRetry && (
                        <button
                            onClick={onRetry}
                            className={`inline-flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white ${buttonColor} rounded-md transition-colors`}
                        >
                            <RefreshCw className="w-4 h-4" />
                            <span>Try Again</span>
                        </button>
                    )}
                    
                    {onCancel && (
                        <button
                            onClick={onCancel}
                            className="inline-flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                        >
                            <span>Cancel</span>
                        </button>
                    )}
                </div>
                
                {error.timestamp && (
                    <span className={`text-xs ${textColor} opacity-60`}>
                        {new Date(error.timestamp).toLocaleTimeString()}
                    </span>
                )}
            </div>

            {/* Category-Specific Tips */}
            {error.category === 'transcription' && (
                <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-xs text-blue-800">
                        <strong>Audio Quality Tips:</strong> Speak clearly, reduce background noise, 
                        ensure good microphone quality, and avoid very quiet recordings.
                    </p>
                </div>
            )}
            
            {error.category === 'upload' && (
                <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
                    <p className="text-xs text-green-800">
                        <strong>Upload Tips:</strong> Check your internet connection, try a smaller file, 
                        or wait a moment and try again.
                    </p>
                </div>
            )}
            
            {(error.category === 'file_format' || error.category === 'file_size') && (
                <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded">
                    <p className="text-xs text-orange-800">
                        <strong>File Requirements:</strong> Use MP3, WAV, M4A, WebM, or OGG format. 
                        Keep files under 100MB and ensure they contain actual audio content.
                    </p>
                </div>
            )}
        </div>
    );
};

export default ErrorDisplay;
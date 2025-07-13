import React from 'react';
import { CheckCircle, Clock, Upload, Mic, Brain, Loader2, AlertTriangle } from 'lucide-react';

const ProcessingStatusIndicator = ({ stage, status, progress, error }) => {
    const getStageInfo = (stage) => {
        const stages = {
            upload: {
                label: 'File Upload',
                icon: Upload,
                description: 'Uploading your audio file to our servers',
                color: 'blue'
            },
            transcribe: {
                label: 'Audio Transcription',
                icon: Mic,
                description: 'Converting your speech to text using AI',
                color: 'purple'
            },
            process_text: {
                label: 'Text Processing',
                icon: Brain,
                description: 'Analyzing and processing the transcribed content',
                color: 'green'
            },
            detect_specialty: {
                label: 'Specialty Detection',
                icon: Brain,
                description: 'Identifying your medical specialty and practice type',
                color: 'indigo'
            },
            generate_content: {
                label: 'Content Generation',
                icon: Brain,
                description: 'Creating personalized website content',
                color: 'pink'
            },
            build_structure: {
                label: 'Website Building',
                icon: Brain,
                description: 'Assembling your complete website structure',
                color: 'orange'
            }
        };
        
        return stages[stage] || {
            label: 'Processing',
            icon: Clock,
            description: 'Processing your request',
            color: 'gray'
        };
    };

    const getStatusIcon = (status) => {
        const iconProps = { className: "w-5 h-5" };
        
        switch (status) {
            case 'completed':
                return <CheckCircle {...iconProps} className="w-5 h-5 text-green-600" />;
            case 'error':
            case 'failed':
                return <AlertTriangle {...iconProps} className="w-5 h-5 text-red-600" />;
            case 'processing':
            default:
                if (stage === 'upload' && progress > 0) {
                    return <Upload {...iconProps} className="w-5 h-5 text-blue-600 animate-pulse" />;
                }
                return <Loader2 {...iconProps} className="w-5 h-5 text-blue-600 animate-spin" />;
        }
    };

    const getStatusColor = (status, baseColor) => {
        switch (status) {
            case 'completed':
                return 'green';
            case 'error':
            case 'failed':
                return 'red';
            case 'processing':
            default:
                return baseColor;
        }
    };

    const getProgressText = (stage, status, progress) => {
        if (status === 'completed') return 'Completed';
        if (status === 'error' || status === 'failed') return 'Failed';
        
        if (stage === 'upload' && progress > 0) {
            return `Uploading... ${progress}%`;
        }
        
        if (progress > 0) {
            return `${progress}% complete`;
        }
        
        return 'In progress...';
    };

    if (!stage) return null;

    const stageInfo = getStageInfo(stage);
    const statusColor = getStatusColor(status, stageInfo.color);
    const progressText = getProgressText(stage, status, progress);

    return (
        <div className={`border-l-4 border-${statusColor}-500 bg-${statusColor}-50 p-4 rounded-r-lg`}>
            <div className="flex items-start space-x-3">
                {getStatusIcon(status)}
                
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <h4 className={`text-sm font-medium text-${statusColor}-800`}>
                            {stageInfo.label}
                        </h4>
                        <span className={`text-xs text-${statusColor}-600 font-medium`}>
                            {progressText}
                        </span>
                    </div>
                    
                    <p className={`text-xs text-${statusColor}-700 mt-1`}>
                        {stageInfo.description}
                    </p>
                    
                    {/* Progress Bar */}
                    {status === 'processing' && progress > 0 && (
                        <div className="mt-2">
                            <div className={`bg-${statusColor}-200 rounded-full h-2 overflow-hidden`}>
                                <div 
                                    className={`bg-${statusColor}-600 h-full transition-all duration-300 ease-out`}
                                    style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                                />
                            </div>
                        </div>
                    )}
                    
                    {/* Error Message */}
                    {(status === 'error' || status === 'failed') && error && (
                        <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-xs text-red-800">
                            {error.message || 'An error occurred during this step'}
                        </div>
                    )}
                    
                    {/* Stage-specific tips */}
                    {status === 'processing' && (
                        <div className="mt-2">
                            {stage === 'upload' && (
                                <p className="text-xs text-blue-600">
                                    💡 Larger files may take longer to upload
                                </p>
                            )}
                            {stage === 'transcribe' && (
                                <p className="text-xs text-purple-600">
                                    💡 This may take 30-60 seconds depending on audio length
                                </p>
                            )}
                            {stage === 'generate_content' && (
                                <p className="text-xs text-pink-600">
                                    💡 Creating personalized content based on your practice
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProcessingStatusIndicator;
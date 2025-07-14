import React, { useState, useRef, useEffect } from 'react';
import { Mic, Upload, FileText, Play, Pause, RotateCcw, Send, Stethoscope, Sparkles, AlertCircle, CheckCircle, ArrowRight, Edit3, X } from 'lucide-react';
import AIProgressIndicator from './AIProgressIndicator.jsx';
import ProcessingStatusIndicator from './ProcessingStatusIndicator.jsx';
import WebsitePreview from './WebsitePreview.jsx';
import ContentManager from './ContentManager.jsx';
import aiService from '../services/aiService.js';
import previewService from '../services/previewService.js';
import contentService from '../services/contentService.js';
import apiService from '../utils/api.js';
import { formatProcessingResultForPreview } from '../utils/previewUtils.js';

export default function DoctorAudioUpload() {
    const [activeTab, setActiveTab] = useState('audio');
    const [isRecording, setIsRecording] = useState(false);
    const [audioFile, setAudioFile] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [textInput, setTextInput] = useState('');
    const [recordingTime, setRecordingTime] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progressData, setProgressData] = useState(null);
    const [processingError, setProcessingError] = useState(null);
    const [validationErrors, setValidationErrors] = useState([]);
    const [processingResult, setProcessingResult] = useState(null);
    const [requestId, setRequestId] = useState(null);
    const [audioLevel, setAudioLevel] = useState(0);
    const [_isRecordingSupported, setIsRecordingSupported] = useState(true);
    const [audioUrl, setAudioUrl] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [previewError, setPreviewError] = useState(null);
    const [showContentManager, setShowContentManager] = useState(false);
    const [contentData, setContentData] = useState(null);
    const [websiteId, setWebsiteId] = useState(null);
    const [websiteData, setWebsiteData] = useState(null);

    const fileInputRef = useRef(null);
    const audioRef = useRef(null);
    const recordingInterval = useRef(null);
    const mediaRecorder = useRef(null);
    const audioChunks = useRef([]);
    const audioContext = useRef(null);
    const analyser = useRef(null);
    const microphone = useRef(null);
    const audioStream = useRef(null);

    const getSupportedMimeType = () => {
        // Prioritize high-quality formats that work well with backends
        const types = [
            'audio/webm;codecs=opus',
            'audio/mp4;codecs=mp4a.40.2', // AAC in MP4
            'audio/ogg;codecs=opus',
            'audio/webm',
            'audio/mp4',
            'audio/ogg',
            'audio/wav'
        ];
        
        for (const type of types) {
            if (MediaRecorder.isTypeSupported(type)) {
                console.log('Using audio format:', type);
                return type;
            }
        }
        
        console.warn('No supported audio format found, using default');
        return 'audio/webm'; // Fallback
    };

    const setupAudioLevelMonitoring = (stream) => {
        try {
            audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
            analyser.current = audioContext.current.createAnalyser();
            microphone.current = audioContext.current.createMediaStreamSource(stream);
            
            analyser.current.fftSize = 256;
            microphone.current.connect(analyser.current);
            
            const bufferLength = analyser.current.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            
            const updateAudioLevel = () => {
                if (analyser.current && isRecording) {
                    analyser.current.getByteFrequencyData(dataArray);
                    const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
                    setAudioLevel(Math.round((average / 255) * 100));
                    requestAnimationFrame(updateAudioLevel);
                }
            };
            
            updateAudioLevel();
        } catch (error) {
            console.warn('Audio level monitoring not available:', error);
        }
    };

    const startRecording = async () => {
        try {
            // Clear previous audio
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
                setAudioUrl(null);
            }
            
            // Check if MediaRecorder is supported
            if (!navigator.mediaDevices || !window.MediaRecorder) {
                setValidationErrors(['Audio recording is not supported in this browser.']);
                setIsRecordingSupported(false);
                return;
            }

            // Request microphone access with optimized audio constraints
            const constraints = {
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: { ideal: 48000, min: 16000 }, // Better compatibility
                    sampleSize: { ideal: 16 },
                    channelCount: { ideal: 1 }, // Mono for smaller files
                    // Additional constraints for better quality
                    latency: { ideal: 0.01 }
                }
            };

            console.log('Requesting microphone access...');
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            audioStream.current = stream;
            
            // Setup audio level monitoring
            setupAudioLevelMonitoring(stream);

            // Get supported MIME type
            const mimeType = getSupportedMimeType();
            
            // Initialize MediaRecorder with optimized configuration
            const options = {
                mimeType: mimeType,
                audioBitsPerSecond: 64000 // Reduced for better compatibility and smaller files
            };
            
            // Try to use higher bitrate if supported
            if (mimeType.includes('opus') || mimeType.includes('aac')) {
                options.audioBitsPerSecond = 96000; // Opus and AAC handle this well
            }
            
            mediaRecorder.current = new MediaRecorder(stream, options);
            audioChunks.current = [];

            console.log('MediaRecorder initialized with:', options);

            mediaRecorder.current.ondataavailable = (event) => {
                console.log('Audio data available:', event.data.size, 'bytes');
                if (event.data.size > 0) {
                    audioChunks.current.push(event.data);
                }
            };

            mediaRecorder.current.onstop = async () => {
                console.log('Recording stopped. Chunks:', audioChunks.current.length);
                
                if (audioChunks.current.length === 0) {
                    setValidationErrors(['No audio data was recorded. Please try again.']);
                    return;
                }

                const audioBlob = new Blob(audioChunks.current, { type: mimeType });
                console.log('Audio blob created:', audioBlob.size, 'bytes, type:', audioBlob.type);
                
                // Validate audio blob has content
                if (audioBlob.size === 0) {
                    setValidationErrors(['Recording failed - no audio data captured.']);
                    return;
                }

                // Create audio URL for playback
                const url = URL.createObjectURL(audioBlob);
                setAudioUrl(url);

                // Determine file extension based on MIME type
                const extension = mimeType.includes('webm') ? 'webm' : 
                                 mimeType.includes('mp4') ? 'm4a' : 
                                 mimeType.includes('ogg') ? 'ogg' : 'wav';
                
                const fileName = `Recording.${extension}`;
                const audioFile = new File([audioBlob], fileName, { type: mimeType });
                
                console.log('Audio file created:', fileName, audioFile.size, 'bytes');
                
                setAudioFile({
                    file: audioFile,
                    name: fileName,
                    size: (audioFile.size / (1024 * 1024)).toFixed(1) + ' MB',
                    duration: formatTime(recordingTime),
                    mimeType: mimeType,
                    url: url
                });
                
                // Clean up audio context
                if (audioContext.current) {
                    audioContext.current.close();
                    audioContext.current = null;
                }
                
                // Stop all tracks to release microphone
                stream.getTracks().forEach(track => {
                    track.stop();
                    console.log('Audio track stopped');
                });
                
                setAudioLevel(0);
            };

            mediaRecorder.current.onerror = (event) => {
                console.error('MediaRecorder error:', event.error);
                setValidationErrors([`Recording error: ${event.error.message}`]);
                stopRecording();
            };

            // Start recording with data collection every 100ms for better responsiveness
            mediaRecorder.current.start(100);
            setIsRecording(true);
            setRecordingTime(0);
            setValidationErrors([]);
            
            console.log('Recording started');
            
            recordingInterval.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
            
        } catch (error) {
            console.error('Failed to start recording:', error);
            let errorMessage = 'Failed to start recording. ';
            
            if (error.name === 'NotAllowedError') {
                errorMessage += 'Microphone access denied. Please allow microphone access and try again.';
            } else if (error.name === 'NotFoundError') {
                errorMessage += 'No microphone found. Please connect a microphone and try again.';
            } else if (error.name === 'NotSupportedError') {
                errorMessage += 'Audio recording is not supported in this browser.';
                setIsRecordingSupported(false);
            } else {
                errorMessage += error.message;
            }
            
            setValidationErrors([errorMessage]);
        }
    };

    const stopRecording = () => {
        console.log('Stopping recording...');
        
        if (mediaRecorder.current && isRecording) {
            try {
                mediaRecorder.current.stop();
                setIsRecording(false);
                clearInterval(recordingInterval.current);
                
                // Stop audio stream tracks
                if (audioStream.current) {
                    audioStream.current.getTracks().forEach(track => track.stop());
                }
                
                console.log('Recording stopped');
            } catch (error) {
                console.error('Error stopping recording:', error);
                setValidationErrors(['Error stopping recording: ' + error.message]);
            }
        }
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            console.log('File uploaded:', file.name, file.size, 'bytes, type:', file.type);
            
            // Validate audio file using aiService validation
            const validation = aiService.validateAudioFile(file);
            if (!validation.isValid) {
                setValidationErrors(validation.errors);
                console.error('Audio file validation failed:', validation.errors);
                return;
            }

            // Clear previous audio URL
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }

            // Create URL for uploaded file
            const url = URL.createObjectURL(file);
            setAudioUrl(url);

            setValidationErrors([]);
            setAudioFile({
                file: file,
                name: file.name,
                size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
                duration: 'Unknown',
                mimeType: file.type,
                url: url
            });
            
            console.log('Audio file set for upload');
        }
    };

    const togglePlayback = () => {
        if (!audioUrl) {
            console.warn('No audio URL available for playback');
            return;
        }

        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
                setIsPlaying(false);
                console.log('Audio playback paused');
            } else {
                audioRef.current.play().then(() => {
                    setIsPlaying(true);
                    console.log('Audio playback started');
                }).catch(error => {
                    console.error('Error playing audio:', error);
                    setValidationErrors(['Error playing audio: ' + error.message]);
                });
            }
        }
    };

    const handleAudioEnded = () => {
        setIsPlaying(false);
        console.log('Audio playback ended');
    };

    const handleAudioError = (error) => {
        console.error('Audio playback error:', error);
        setIsPlaying(false);
        setValidationErrors(['Audio playback error. The audio file may be corrupted.']);
    };

    const resetAudio = () => {
        console.log('Resetting audio...');
        
        // Stop playback if active
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        
        // Clean up audio URL
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
            setAudioUrl(null);
        }
        
        // Reset state
        setAudioFile(null);
        setIsPlaying(false);
        setRecordingTime(0);
        setAudioLevel(0);
        setValidationErrors([]);
        
        // Clear file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        
        console.log('Audio reset complete');
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handlePreviewGeneration = (processingResult) => {
        try {
            // Format the processing result for preview
            const formattedData = formatProcessingResultForPreview(processingResult);
            
            if (formattedData) {
                // Use previewService to further format the data
                const previewData = previewService.formatWebsiteData(formattedData);
                
                console.log('Generated preview data:', previewData);
                setPreviewData(previewData);
                setShowPreview(true);
                setPreviewError(null);
            } else {
                console.error('Failed to format processing result for preview');
                setPreviewError('Failed to generate preview from processing result');
            }
        } catch (error) {
            console.error('Error generating preview:', error);
            setPreviewError('Error generating website preview: ' + error.message);
        }
    };

    const handlePreviewRefresh = async () => {
        if (websiteId) {
            try {
                console.log('Refreshing preview from backend...');
                const response = await apiService.getPreviewData(websiteId, { 
                    deviceType: 'desktop', 
                    zoom: 100 
                });
                setPreviewData(response.data);
                setPreviewError(null);
            } catch (error) {
                console.error('Error refreshing preview:', error);
                setPreviewError('Error refreshing preview: ' + apiService.handleAPIError(error));
            }
        } else if (processingResult && processingResult.data) {
            try {
                console.log('Refreshing preview from local data...');
                handlePreviewGeneration(processingResult);
            } catch (error) {
                console.error('Error refreshing preview:', error);
                setPreviewError('Error refreshing preview: ' + error.message);
            }
        }
    };

    // Content management handlers
    const handleContentChange = async (updatedContent) => {
        setContentData(updatedContent);
        
        // Update backend if websiteId exists
        if (websiteId && updatedContent) {
            try {
                const websiteData = contentService.transformToWebsiteData(updatedContent);
                await apiService.updateContent(websiteId, websiteData);
                console.log('Content updated in backend');
                
                // Refresh preview
                await handlePreviewRefresh();
            } catch (error) {
                console.error('Failed to update content in backend:', error);
            }
        } else if (updatedContent) {
            // Fallback to local preview update
            const websiteData = contentService.transformToWebsiteData(updatedContent);
            const formattedData = formatProcessingResultForPreview({ data: websiteData });
            if (formattedData) {
                const previewData = previewService.formatWebsiteData(formattedData);
                setPreviewData(previewData);
            }
        }
    };

    const handleContentSave = async (contentData) => {
        try {
            console.log('Saving content changes...');
            
            if (websiteId) {
                // Save to backend
                const websiteData = contentService.transformToWebsiteData(contentData);
                await apiService.saveWebsite(websiteId, { content: websiteData });
                console.log('Content saved to backend successfully');
            } else {
                // Fallback to local update
                const websiteData = contentService.transformToWebsiteData(contentData);
                setProcessingResult(prev => ({
                    ...prev,
                    data: websiteData
                }));
                console.log('Content saved locally');
            }
        } catch (error) {
            console.error('Error saving content:', apiService.handleAPIError(error));
            throw error;
        }
    };

    const handleSectionUpdate = async (sectionId, content) => {
        if (!websiteId) return;
        
        try {
            const response = await apiService.updateContentSection(websiteId, sectionId, content);
            
            // Update local state
            setWebsiteData(prev => ({
                ...prev,
                content: {
                    ...prev.content,
                    [sectionId]: response.data.content
                }
            }));
            
            // Trigger preview refresh
            await handlePreviewRefresh();
        } catch (error) {
            console.error(`Failed to update ${sectionId} section:`, apiService.handleAPIError(error));
            throw error;
        }
    };

    const handleShowContentManager = () => {
        if (processingResult && processingResult.data) {
            setShowContentManager(true);
        }
    };

    const handleCloseContentManager = () => {
        setShowContentManager(false);
    };

    const validateAudioFile = async (file) => {
        const errors = [];
        
        console.log('Validating audio file:', file.name, file.size, 'bytes');
        
        // Check file size
        if (file.size === 0) {
            errors.push('Audio file is empty');
        } else if (file.size > 100 * 1024 * 1024) {
            errors.push('Audio file is too large (max 100MB)');
        } else if (file.size < 1000) {
            errors.push('Audio file is too small (likely contains no audio)');
        }
        
        // Check file type - more comprehensive validation
        const allowedTypes = [
            'audio/webm', 'audio/mp4', 'audio/ogg', 'audio/wav', 'audio/mpeg', 'audio/m4a',
            'audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/mp3'
        ];
        const isValidType = allowedTypes.some(type => {
            return file.type === type || file.type.includes(type.split(';')[0]);
        });
        
        if (!isValidType) {
            errors.push(`Invalid audio format: ${file.type}. Please use MP3, WAV, M4A, WebM, or OGG format`);
        }
        
        // Try to create audio element to validate
        return new Promise((resolve) => {
            const audio = new Audio();
            const url = URL.createObjectURL(file);
            
            audio.onloadedmetadata = () => {
                console.log('Audio metadata loaded:', audio.duration, 'seconds');
                
                if (audio.duration === 0 || isNaN(audio.duration)) {
                    errors.push('Audio file appears to have no content');
                }
                
                URL.revokeObjectURL(url);
                resolve({
                    isValid: errors.length === 0,
                    errors,
                    duration: audio.duration
                });
            };
            
            audio.onerror = () => {
                console.error('Error loading audio for validation');
                errors.push('Audio file is corrupted or invalid');
                URL.revokeObjectURL(url);
                resolve({
                    isValid: false,
                    errors,
                    duration: 0
                });
            };
            
            audio.src = url;
        });
    };

    const handleSubmit = async () => {
        // Clear previous errors and results
        setProcessingError(null);
        setValidationErrors([]);
        setProcessingResult(null);
        setRequestId(null);

        try {
            if (activeTab === 'audio' && audioFile?.file) {
                console.log('Starting audio processing for file:', audioFile.name);
                
                // Validate audio file before processing using aiService validation
                const validation = aiService.validateAudioFile(audioFile.file);
                if (!validation.isValid) {
                    setValidationErrors(validation.errors || ['Invalid audio file']);
                    console.error('Audio validation failed:', validation.errors);
                    return;
                }
                
                // Additional client-side validation for recorded audio
                const enhancedValidation = await validateAudioFile(audioFile.file);
                if (!enhancedValidation.isValid) {
                    setValidationErrors(enhancedValidation.errors || ['Audio file validation failed']);
                    console.error('Enhanced audio validation failed:', enhancedValidation.errors);
                    return;
                }
                
                console.log('Audio validation passed, duration:', validation.duration, 'seconds');

                setIsProcessing(true);
                
                // Show initial upload progress
                setProgressData({
                    currentStep: 0,
                    totalSteps: 6,
                    stepId: 'upload',
                    stepLabel: 'Preparing audio upload...',
                    status: 'processing',
                    progress: 0,
                    inputType: 'audio'
                });
                
                try {
                    const result = await aiService.processAudioInput(
                        audioFile.file,
                        (progressUpdate) => {
                            // Add defensive checks for progress update
                            if (progressUpdate && typeof progressUpdate === 'object') {
                                console.log('Audio processing progress:', progressUpdate);
                                setProgressData(progressUpdate);
                                // Extract requestId if available
                                if (progressUpdate.requestId && !requestId) {
                                    setRequestId(progressUpdate.requestId);
                                    console.log('Audio processing started with requestId:', progressUpdate.requestId);
                                }
                                
                                // Update validation errors if there are stage-specific issues
                                if (progressUpdate.status === 'error' && progressUpdate.stepId) {
                                    const stageError = `${progressUpdate.stepLabel || 'Processing'} failed: ${progressUpdate.error || 'Unknown error'}`;
                                    setValidationErrors([stageError]);
                                }
                            }
                        }
                    );
                    
                    if (result?.success) {
                        setProcessingResult(result);
                        setIsProcessing(false);
                        
                        // Generate preview from processing result
                        handlePreviewGeneration(result);
                        
                        // Note: Removed the automatic redirect alert since we now show preview
                    } else {
                        throw new Error(result?.message || 'Processing failed');
                    }
                } catch (error) {
                    console.error('Audio processing error:', error);
                    
                    // Use the enhanced error handling from aiService
                    const processedError = {
                        ...error,
                        category: error.category || 'unknown',
                        severity: error.severity || 'error',
                        guidance: error.guidance || 'Please try again.',
                        stage: error.stage || 'unknown',
                        retryable: error.retryable !== undefined ? error.retryable : true
                    };
                    
                    console.log('Processed audio error:', processedError);
                    
                    setProcessingError(processedError);
                    setIsProcessing(false);
                    setProgressData(null);
                }

            } else if (activeTab === 'text' && textInput?.trim()) {
                // Validate text input before processing
                const validation = aiService.validateTextInput(textInput);
                if (!validation.isValid) {
                    setValidationErrors(validation.errors || ['Invalid text input']);
                    return;
                }

                setIsProcessing(true);
                
                try {
                    const result = await aiService.processTextInput(
                        textInput,
                        (progressUpdate) => {
                            // Add defensive checks for progress update
                            if (progressUpdate && typeof progressUpdate === 'object') {
                                setProgressData(progressUpdate);
                                // Extract requestId if available
                                if (progressUpdate.requestId && !requestId) {
                                    setRequestId(progressUpdate.requestId);
                                }
                            }
                        }
                    );
                    
                    if (result?.success) {
                        setProcessingResult(result);
                        setIsProcessing(false);
                        
                        // Generate preview from processing result
                        handlePreviewGeneration(result);
                        
                        // Note: Removed the automatic redirect alert since we now show preview
                    } else {
                        throw new Error(result?.message || 'Processing failed');
                    }
                } catch (error) {
                    console.error('Text processing error:', error);
                    setProcessingError(error);
                    setIsProcessing(false);
                    setProgressData(null);
                }
            } else {
                setValidationErrors(['Please provide valid input to process']);
            }
        } catch (error) {
            console.error('Submit error:', error);
            setProcessingError(error);
            setIsProcessing(false);
            setProgressData(null);
        }
    };

    const handleRetry = () => {
        setProcessingError(null);
        setProgressData(null);
        handleSubmit();
    };

    const handleCancel = async () => {
        if (requestId && isProcessing) {
            try {
                await aiService.cancelProcessing(requestId);
                setIsProcessing(false);
                setProgressData(null);
                setRequestId(null);
            } catch (error) {
                console.error('Failed to cancel processing:', error);
            }
        }
    };

    const canSubmit = (activeTab === 'audio' && audioFile) || (activeTab === 'text' && textInput.trim());

    // Handle tab switching - preserve data and clear errors
    const handleTabSwitch = (newTab) => {
        if (newTab !== activeTab) {
            setActiveTab(newTab);
            setValidationErrors([]);
            setProcessingError(null);
        }
    };

    // Handle text input changes with validation
    const handleTextInputChange = (e) => {
        const text = e.target.value;
        setTextInput(text);
        
        // Clear validation errors when user starts typing
        if (validationErrors.length > 0) {
            setValidationErrors([]);
        }
    };

    // Cleanup effect for when component unmounts
    useEffect(() => {
        return () => {
            // Clean up recording
            if (recordingInterval.current) {
                clearInterval(recordingInterval.current);
            }
            if (mediaRecorder.current && isRecording) {
                mediaRecorder.current.stop();
            }
            
            // Clean up audio stream
            if (audioStream.current) {
                audioStream.current.getTracks().forEach(track => track.stop());
            }
            
            // Clean up audio context
            if (audioContext.current) {
                audioContext.current.close();
            }
            
            // Clean up audio URL
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }
        };
    }, [isRecording, audioUrl]);

    // Check recording support on mount
    useEffect(() => {
        const checkRecordingSupport = () => {
            const isSupported = !!(navigator.mediaDevices && 
                                  navigator.mediaDevices.getUserMedia && 
                                  window.MediaRecorder);
            setIsRecordingSupported(isSupported);
            
            if (!isSupported) {
                console.warn('Audio recording is not supported in this browser');
            }
        };
        
        checkRecordingSupport();
    }, []);

    // Fetch website data after successful AI processing
    useEffect(() => {
        if (processingResult?.data?.websiteId) {
            const fetchWebsiteData = async () => {
                try {
                    console.log('Fetching website data from backend...');
                    const response = await apiService.getPreviewData(
                        processingResult.data.websiteId,
                        { deviceType: 'desktop', zoom: 100 }
                    );
                    
                    setWebsiteId(processingResult.data.websiteId);
                    setWebsiteData(response.data);
                    setPreviewData(response.data);
                    console.log('Website data fetched successfully');
                } catch (error) {
                    console.error('Failed to fetch website data:', error);
                    setPreviewError('Failed to load website data: ' + apiService.handleAPIError(error));
                    
                    // Fallback to local data processing
                    handlePreviewGeneration(processingResult);
                }
            };

            fetchWebsiteData();
        }
    }, [processingResult]);

    return (
        <div className="doctor-audio-upload min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-blue-100">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center space-x-3">
                        <div className="bg-blue-600 p-2 rounded-lg">
                            <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Doctor's Website Builder</h1>
                            <p className="text-xs sm:text-sm text-gray-600">Tell us about your practice</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* Progress Indicator */}
                    <div className="bg-gradient-to-r from-blue-600 to-green-600 px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-white space-y-2 sm:space-y-0">
                            <div className="flex items-center space-x-2">
                                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="text-sm sm:text-base font-semibold">Step 1 of 3: Share Your Practice Details</span>
                            </div>
                            <div className="text-xs sm:text-sm opacity-90">AI-Powered Generation</div>
                        </div>
                    </div>

                    {/* Tab Selection */}
                    <div className="border-b border-gray-200">
                        <div className="flex">
                            <button
                                onClick={() => handleTabSwitch('audio')}
                                disabled={isProcessing}
                                className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 text-center font-medium transition-all duration-200 ${activeTab === 'audio'
                                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                                    <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span className="text-sm sm:text-base">Record Audio</span>
                                </div>
                            </button>
                            <button
                                onClick={() => handleTabSwitch('text')}
                                disabled={isProcessing}
                                className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 text-center font-medium transition-all duration-200 ${activeTab === 'text'
                                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                                    <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span className="text-sm sm:text-base">Type Text</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Validation Errors */}
                    {validationErrors.length > 0 && (
                        <div className="bg-red-50 border-b border-red-200 px-6 py-4">
                            <div className="flex items-start space-x-3">
                                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h3 className="text-sm font-medium text-red-800">Please fix the following errors:</h3>
                                    <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                                        {validationErrors.map((error, index) => (
                                            <li key={index}>{error}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Success Result */}
                    {processingResult && !isProcessing && showPreview && (
                        <div className="bg-green-50 border-b border-green-200 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                    <div>
                                        <h3 className="text-sm font-medium text-green-800">Website Generated Successfully!</h3>
                                        <p className="text-sm text-green-700">
                                            Your website preview is ready. Review it below and continue to customization.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={handleShowContentManager}
                                        className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                        <span className="text-sm font-medium">Edit Content</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            // Simulate navigation to customization
                                            alert('Proceeding to customization phase...');
                                        }}
                                        className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        <span className="text-sm font-medium">Continue to Customization</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Content Area */}
                    <div className="p-4 sm:p-6 lg:p-8">
                        {activeTab === 'audio' ? (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                        Tell Us About Your Medical Practice
                                    </h2>
                                    <p className="text-gray-600 max-w-2xl mx-auto">
                                        Record yourself describing your practice, specialties, services, and what makes you unique.
                                        Our AI will create your professional website content from your voice.
                                    </p>
                                </div>

                                {/* Recording Interface */}
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">
                                    {!audioFile ? (
                                        <div className="text-center space-y-6">
                                            {/* Recording Button */}
                                            <div className="flex justify-center">
                                                <button
                                                    onClick={isRecording ? stopRecording : startRecording}
                                                    className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${isRecording
                                                        ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                                                        : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'
                                                        }`}
                                                >
                                                    <Mic className={`w-10 h-10 text-white ${isRecording ? 'animate-pulse' : ''}`} />
                                                </button>
                                            </div>

                                            {/* Recording Status */}
                                            {isRecording && (
                                                <div className="space-y-4">
                                                    <div className="text-red-600 font-semibold">Recording...</div>
                                                    <div className="text-2xl font-mono text-gray-700">
                                                        {formatTime(recordingTime)}
                                                    </div>
                                                    
                                                    {/* Audio Level Indicator */}
                                                    <div className="space-y-2">
                                                        <div className="text-sm text-gray-600">Audio Level:</div>
                                                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                                            <div 
                                                                className={`h-full transition-all duration-100 ${audioLevel > 0 ? 'bg-green-500' : 'bg-gray-300'}`}
                                                                style={{ width: `${Math.max(5, audioLevel)}%` }}
                                                            />
                                                        </div>
                                                        <div className="text-xs text-center text-gray-500">
                                                            {audioLevel > 0 ? '🎤 Audio detected' : '🔇 No audio detected'}
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="text-sm text-gray-500">
                                                        Speak clearly about your practice, services, and expertise
                                                    </div>
                                                    
                                                    {/* Warning if no audio detected */}
                                                    {isRecording && recordingTime > 3 && audioLevel === 0 && (
                                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                                            <div className="text-yellow-800 text-sm">
                                                                ⚠️ No audio is being detected. Please check your microphone.
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {!isRecording && (
                                                <div className="space-y-4">
                                                    <div className="text-gray-700 font-medium">
                                                        Click to start recording
                                                    </div>

                                                    {/* File Upload Alternative */}
                                                    <div className="flex items-center justify-center space-x-4">
                                                        <div className="text-sm text-gray-500">or</div>
                                                    </div>

                                                    <button
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className="inline-flex items-center space-x-2 px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                                    >
                                                        <Upload className="w-5 h-5 text-gray-600" />
                                                        <span className="text-gray-700">Upload Audio File</span>
                                                    </button>

                                                    <input
                                                        ref={fileInputRef}
                                                        type="file"
                                                        accept="audio/*"
                                                        onChange={handleFileUpload}
                                                        className="hidden"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        /* Audio File Display */
                                        <div className="space-y-4">
                                            {/* Audio File Info */}
                                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="bg-green-100 p-2 rounded-lg">
                                                            <FileText className="w-5 h-5 text-green-600" />
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-gray-900">{audioFile.name}</div>
                                                            <div className="text-sm text-gray-500">
                                                                {audioFile.size} • {audioFile.duration}
                                                                {audioFile.mimeType && (
                                                                    <span> • {audioFile.mimeType}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={togglePlayback}
                                                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                                            disabled={!audioUrl}
                                                            title={audioUrl ? "Play/Pause audio" : "Audio not available"}
                                                        >
                                                            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                                        </button>
                                                        <button
                                                            onClick={resetAudio}
                                                            className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                                                            title="Remove audio and start over"
                                                        >
                                                            <RotateCcw className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                                
                                                {/* Audio Element for playback */}
                                                {audioUrl && (
                                                    <audio
                                                        ref={audioRef}
                                                        src={audioUrl}
                                                        onEnded={handleAudioEnded}
                                                        onError={handleAudioError}
                                                        className="w-full"
                                                        controls
                                                        preload="metadata"
                                                    />
                                                )}
                                            </div>

                                            {/* Audio Status */}
                                            <div className="text-center">
                                                <div className="inline-flex items-center space-x-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg border border-green-200">
                                                    <CheckCircle className="w-4 h-4" />
                                                    <span className="text-sm font-medium">Audio ready for processing</span>
                                                </div>
                                                <div className="text-xs text-gray-500 mt-2">
                                                    Click "Generate Website" to continue with AI processing
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Sample Questions */}
                                <div className="bg-green-50 rounded-xl p-6 border border-green-100">
                                    <h3 className="font-semibold text-green-800 mb-3">💡 What to include in your recording:</h3>
                                    <ul className="space-y-2 text-sm text-green-700">
                                        <li>• Your medical specialty and qualifications</li>
                                        <li>• Services and treatments you offer</li>
                                        <li>• What makes your practice unique</li>
                                        <li>• Your approach to patient care</li>
                                        <li>• Contact information and location</li>
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                        Describe Your Medical Practice
                                    </h2>
                                    <p className="text-gray-600 max-w-2xl mx-auto">
                                        Write about your practice, specialties, services, and what makes you unique.
                                        Our AI will create your professional website content from your description.
                                    </p>
                                </div>

                                {/* Text Input */}
                                <div className="space-y-4">
                                    <textarea
                                        value={textInput}
                                        onChange={handleTextInputChange}
                                        disabled={isProcessing}
                                        placeholder="Tell us about your medical practice... For example:

I am Dr. Sarah Johnson, a board-certified cardiologist with over 15 years of experience. I specialize in preventive cardiology and heart disease management. My practice focuses on comprehensive cardiac care including ECGs, stress tests, and lifestyle counseling. I believe in personalized patient care and work closely with each patient to develop treatment plans that fit their unique needs. 

My clinic is located in downtown Springfield, and I offer both in-person and telemedicine consultations. What sets my practice apart is my commitment to patient education and preventive care..."
                                        className="w-full h-64 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-700"
                                    />

                                    <div className="flex justify-between items-center text-sm text-gray-500">
                                        <span>{textInput.length} characters</span>
                                        <span>Minimum 100 characters recommended</span>
                                    </div>
                                </div>

                                {/* Guidelines */}
                                <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                                    <h3 className="font-semibold text-blue-800 mb-3">💡 What to include in your description:</h3>
                                    <ul className="space-y-2 text-sm text-blue-700">
                                        <li>• Your name, title, and medical qualifications</li>
                                        <li>• Your medical specialty and areas of expertise</li>
                                        <li>• Services, treatments, and procedures you offer</li>
                                        <li>• Your approach to patient care and philosophy</li>
                                        <li>• Clinic location and contact information</li>
                                        <li>• What makes your practice unique or special</li>
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex justify-center pt-8">
                            <button
                                onClick={handleSubmit}
                                disabled={!canSubmit || isProcessing}
                                className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center space-x-3 ${canSubmit && !isProcessing
                                    ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white hover:from-blue-700 hover:to-green-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Processing with AI...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-6 h-6" />
                                        <span>Generate My Website</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* AI Progress Indicator */}
                {(isProcessing || processingError) && (
                    <div className="mt-8 space-y-4">
                        <AIProgressIndicator
                            progressData={progressData}
                            isProcessing={isProcessing}
                            error={processingError}
                            onRetry={handleRetry}
                            onCancel={handleCancel}
                            canCancel={!!requestId}
                        />
                        
                        {/* Detailed Stage Status */}
                        {isProcessing && progressData && progressData.stepId && (
                            <div className="bg-white rounded-lg border border-gray-200 p-4">
                                <h3 className="text-sm font-medium text-gray-900 mb-3">Current Stage Details</h3>
                                <ProcessingStatusIndicator
                                    stage={progressData.stepId}
                                    status={progressData.status}
                                    progress={progressData.progress}
                                    error={processingError}
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Website Preview */}
                {showPreview && previewData && (
                    <div className="mt-8">
                        <WebsitePreview
                            websiteData={previewData}
                            websiteId={websiteId}
                            error={previewError}
                            onRefresh={handlePreviewRefresh}
                            className="shadow-lg"
                        />
                    </div>
                )}

                {/* Footer Note */}
                <div className="text-center mt-8 text-sm text-gray-500">
                    <p>🔒 Your data is secure and HIPAA-compliant • ⚡ AI processing takes 30-60 seconds</p>
                </div>
            </div>

            {/* Content Manager Modal */}
            {showContentManager && processingResult && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-7xl max-h-[95vh] overflow-hidden">
                        <div className="border-b border-gray-200 p-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-gray-900">Content Management</h2>
                                <button
                                    onClick={handleCloseContentManager}
                                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="p-4 overflow-auto" style={{ maxHeight: 'calc(95vh - 80px)' }}>
                            <ContentManager
                                websiteData={websiteData || processingResult.data}
                                websiteId={websiteId}
                                onSave={handleContentSave}
                                onPreview={handlePreviewRefresh}
                                onContentChange={handleContentChange}
                                onSectionUpdate={handleSectionUpdate}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

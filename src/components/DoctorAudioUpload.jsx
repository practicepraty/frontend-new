import React, { useState, useRef } from 'react';
import { Mic, Upload, FileText, Play, Pause, RotateCcw, Send, Stethoscope, Sparkles } from 'lucide-react';

export default function DoctorAudioUpload() {
    const [activeTab, setActiveTab] = useState('audio');
    const [isRecording, setIsRecording] = useState(false);
    const [audioFile, setAudioFile] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [textInput, setTextInput] = useState('');
    const [recordingTime, setRecordingTime] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);

    const fileInputRef = useRef(null);
    // eslint-disable-next-line no-unused-vars
    const audioRef = useRef(null);
    const recordingInterval = useRef(null);

    const startRecording = () => {
        setIsRecording(true);
        setRecordingTime(0);
        recordingInterval.current = setInterval(() => {
            setRecordingTime(prev => prev + 1);
        }, 1000);
        // Simulate recording - in real implementation, use MediaRecorder API
    };

    const stopRecording = () => {
        setIsRecording(false);
        clearInterval(recordingInterval.current);
        // Simulate audio file creation
        setAudioFile({ name: 'Recording.wav', size: '2.3 MB', duration: formatTime(recordingTime) });
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setAudioFile({
                name: file.name,
                size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
                duration: 'Unknown'
            });
        }
    };

    const togglePlayback = () => {
        setIsPlaying(!isPlaying);
        // In real implementation, control audio playback
    };

    const resetAudio = () => {
        setAudioFile(null);
        setIsPlaying(false);
        setRecordingTime(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSubmit = () => {
        if ((activeTab === 'audio' && audioFile) || (activeTab === 'text' && textInput.trim())) {
            setIsProcessing(true);
            // Simulate processing
            setTimeout(() => {
                setIsProcessing(false);
                alert('Your content has been processed! Redirecting to customization...');
            }, 3000);
        }
    };

    const canSubmit = (activeTab === 'audio' && audioFile) || (activeTab === 'text' && textInput.trim());

    return (
        <div className="doctor-audio-upload min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-blue-100">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <div className="flex items-center space-x-3">
                        <div className="bg-blue-600 p-2 rounded-lg">
                            <Stethoscope className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Doctor's Website Builder</h1>
                            <p className="text-sm text-gray-600">Tell us about your practice</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-6 py-8">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* Progress Indicator */}
                    <div className="bg-gradient-to-r from-blue-600 to-green-600 px-6 py-4">
                        <div className="flex items-center justify-between text-white">
                            <div className="flex items-center space-x-2">
                                <Sparkles className="w-5 h-5" />
                                <span className="font-semibold">Step 1 of 3: Share Your Practice Details</span>
                            </div>
                            <div className="text-sm opacity-90">AI-Powered Generation</div>
                        </div>
                    </div>

                    {/* Tab Selection */}
                    <div className="border-b border-gray-200">
                        <div className="flex">
                            <button
                                onClick={() => setActiveTab('audio')}
                                className={`flex-1 px-6 py-4 text-center font-medium transition-all duration-200 ${activeTab === 'audio'
                                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-center justify-center space-x-2">
                                    <Mic className="w-5 h-5" />
                                    <span>Record Audio</span>
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('text')}
                                className={`flex-1 px-6 py-4 text-center font-medium transition-all duration-200 ${activeTab === 'text'
                                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-center justify-center space-x-2">
                                    <FileText className="w-5 h-5" />
                                    <span>Type Text</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-8">
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
                                                <div className="space-y-2">
                                                    <div className="text-red-600 font-semibold">Recording...</div>
                                                    <div className="text-2xl font-mono text-gray-700">
                                                        {formatTime(recordingTime)}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        Speak clearly about your practice, services, and expertise
                                                    </div>
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
                                            <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-gray-200">
                                                <div className="flex items-center space-x-3">
                                                    <div className="bg-blue-100 p-2 rounded-lg">
                                                        <FileText className="w-5 h-5 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{audioFile.name}</div>
                                                        <div className="text-sm text-gray-500">
                                                            {audioFile.size} • {audioFile.duration}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={togglePlayback}
                                                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                    >
                                                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                                    </button>
                                                    <button
                                                        onClick={resetAudio}
                                                        className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                                                    >
                                                        <RotateCcw className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="text-center text-sm text-gray-600">
                                                Audio ready for processing. Click "Generate Website" to continue.
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
                                        onChange={(e) => setTextInput(e.target.value)}
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

                {/* Footer Note */}
                <div className="text-center mt-8 text-sm text-gray-500">
                    <p>🔒 Your data is secure and HIPAA-compliant • ⚡ AI processing takes 30-60 seconds</p>
                </div>
            </div>
        </div>
    );
}

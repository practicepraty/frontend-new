import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image, Crop, RotateCw, Download, AlertCircle, CheckCircle } from 'lucide-react';

export default function ImageUploader({ 
    onUpload, 
    onClose, 
    maxFileSize = 10 * 1024 * 1024, // 10MB
    acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
    showCropTools = true,
    showOptimization = true
}) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [errors, setErrors] = useState([]);
    const [cropSettings, setCropSettings] = useState({
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        aspectRatio: 'free'
    });
    const [optimizationSettings, setOptimizationSettings] = useState({
        quality: 0.8,
        maxWidth: 1200,
        maxHeight: 800,
        format: 'webp'
    });
    const [showCropModal, setShowCropModal] = useState(false);
    const [showOptimizationModal, setShowOptimizationModal] = useState(false);

    const fileInputRef = useRef(null);
    const canvasRef = useRef(null);
    const imageRef = useRef(null);

    // Validate file
    const validateFile = (file) => {
        const validationErrors = [];
        
        if (!file) {
            validationErrors.push('Please select a file');
            return validationErrors;
        }

        // Check file type
        if (!acceptedTypes.includes(file.type)) {
            validationErrors.push(`File type not supported. Please use ${acceptedTypes.join(', ')}`);
        }

        // Check file size
        if (file.size > maxFileSize) {
            const maxSizeMB = (maxFileSize / (1024 * 1024)).toFixed(1);
            validationErrors.push(`File too large. Maximum size is ${maxSizeMB}MB`);
        }

        // Check if it's actually an image
        if (!file.type.startsWith('image/')) {
            validationErrors.push('Please select an image file');
        }

        return validationErrors;
    };

    // Handle file selection
    const handleFileSelect = useCallback((file) => {
        const validationErrors = validateFile(file);
        
        if (validationErrors.length > 0) {
            setErrors(validationErrors);
            return;
        }

        setErrors([]);
        setSelectedFile(file);
        
        // Create preview URL
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        
        // Load image to get dimensions
        const img = new Image();
        img.onload = () => {
            setCropSettings(prev => ({
                ...prev,
                width: img.width,
                height: img.height
            }));
        };
        img.src = url;
    }, [maxFileSize, acceptedTypes]);

    // Handle file input change
    const handleFileInputChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    // Handle drag and drop
    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    };

    // Optimize image
    const optimizeImage = (file, settings) => {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                // Calculate new dimensions
                let { width, height } = img;
                const aspectRatio = width / height;
                
                if (width > settings.maxWidth) {
                    width = settings.maxWidth;
                    height = width / aspectRatio;
                }
                
                if (height > settings.maxHeight) {
                    height = settings.maxHeight;
                    width = height * aspectRatio;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // Draw and compress
                ctx.drawImage(img, 0, 0, width, height);
                
                canvas.toBlob(resolve, `image/${settings.format}`, settings.quality);
            };
            
            img.onerror = reject;
            img.src = URL.createObjectURL(file);
        });
    };

    // Crop image
    const cropImage = (file, cropSettings) => {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                canvas.width = cropSettings.width;
                canvas.height = cropSettings.height;
                
                ctx.drawImage(
                    img,
                    cropSettings.x,
                    cropSettings.y,
                    cropSettings.width,
                    cropSettings.height,
                    0,
                    0,
                    cropSettings.width,
                    cropSettings.height
                );
                
                canvas.toBlob(resolve, file.type, 0.9);
            };
            
            img.onerror = reject;
            img.src = URL.createObjectURL(file);
        });
    };

    // Simulate upload (replace with actual upload logic)
    const uploadImage = async (file) => {
        return new Promise((resolve, reject) => {
            // Simulate upload progress
            let progress = 0;
            const interval = setInterval(() => {
                progress += 10;
                setUploadProgress(progress);
                
                if (progress >= 100) {
                    clearInterval(interval);
                    // Simulate successful upload - return URL
                    const mockUrl = URL.createObjectURL(file);
                    resolve(mockUrl);
                }
            }, 200);
        });
    };

    // Handle final upload
    const handleUpload = async () => {
        if (!selectedFile) return;

        setIsUploading(true);
        setUploadProgress(0);

        try {
            let processedFile = selectedFile;

            // Apply cropping if enabled
            if (showCropTools && cropSettings.width < selectedFile.width) {
                processedFile = await cropImage(processedFile, cropSettings);
            }

            // Apply optimization if enabled
            if (showOptimization) {
                processedFile = await optimizeImage(processedFile, optimizationSettings);
            }

            // Upload the file
            const imageUrl = await uploadImage(processedFile);
            
            // Clean up
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
            
            onUpload(imageUrl);
        } catch (error) {
            console.error('Upload failed:', error);
            setErrors(['Upload failed. Please try again.']);
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    // Handle close
    const handleClose = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        onClose();
    };

    // Format file size
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Get image dimensions
    const getImageDimensions = (file) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve({ width: img.width, height: img.height });
            img.src = URL.createObjectURL(file);
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="border-b border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Image className="w-5 h-5 text-blue-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Upload Image</h2>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Upload area */}
                <div className="p-6">
                    {!selectedFile ? (
                        <div
                            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                                isDragging
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-300 hover:border-gray-400'
                            }`}
                            onDragEnter={handleDragEnter}
                            onDragLeave={handleDragLeave}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                        >
                            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {isDragging ? 'Drop your image here' : 'Upload an image'}
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Drag and drop an image file, or click to browse
                            </p>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Choose File
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept={acceptedTypes.join(',')}
                                onChange={handleFileInputChange}
                                className="hidden"
                            />
                            <p className="text-xs text-gray-500 mt-4">
                                Supported formats: {acceptedTypes.join(', ')} • Max size: {formatFileSize(maxFileSize)}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Preview */}
                            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0">
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="w-24 h-24 object-cover rounded-lg"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900 mb-1">{selectedFile.name}</h4>
                                        <p className="text-sm text-gray-600 mb-2">
                                            {formatFileSize(selectedFile.size)} • {selectedFile.type}
                                        </p>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => setSelectedFile(null)}
                                                className="text-sm text-red-600 hover:text-red-700"
                                            >
                                                Remove
                                            </button>
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="text-sm text-blue-600 hover:text-blue-700"
                                            >
                                                Replace
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tools */}
                            {(showCropTools || showOptimization) && (
                                <div className="flex items-center space-x-2">
                                    {showCropTools && (
                                        <button
                                            onClick={() => setShowCropModal(true)}
                                            className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                        >
                                            <Crop className="w-4 h-4" />
                                            <span>Crop</span>
                                        </button>
                                    )}
                                    {showOptimization && (
                                        <button
                                            onClick={() => setShowOptimizationModal(true)}
                                            className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                        >
                                            <RotateCw className="w-4 h-4" />
                                            <span>Optimize</span>
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Upload progress */}
                            {isUploading && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Uploading...</span>
                                        <span className="text-sm text-gray-600">{uploadProgress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Error display */}
                    {errors.length > 0 && (
                        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center space-x-2">
                                <AlertCircle className="w-5 h-5 text-red-600" />
                                <span className="font-medium text-red-800">Upload Error</span>
                            </div>
                            <ul className="mt-2 text-sm text-red-700 space-y-1">
                                {errors.map((error, index) => (
                                    <li key={index}>{error}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 p-4">
                    <div className="flex items-center justify-end space-x-2">
                        <button
                            onClick={handleClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleUpload}
                            disabled={!selectedFile || isUploading || errors.length > 0}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                                !selectedFile || isUploading || errors.length > 0
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                        >
                            {isUploading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Uploading...</span>
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4" />
                                    <span>Upload Image</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Hidden file input for replacements */}
            <input
                ref={fileInputRef}
                type="file"
                accept={acceptedTypes.join(',')}
                onChange={handleFileInputChange}
                className="hidden"
            />

            {/* Crop modal */}
            {showCropModal && (
                <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-60">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Crop Image</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Aspect Ratio
                                </label>
                                <select
                                    value={cropSettings.aspectRatio}
                                    onChange={(e) => setCropSettings(prev => ({ ...prev, aspectRatio: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="free">Free</option>
                                    <option value="1:1">Square (1:1)</option>
                                    <option value="4:3">Standard (4:3)</option>
                                    <option value="16:9">Widescreen (16:9)</option>
                                    <option value="3:2">Photo (3:2)</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex items-center justify-end space-x-2 mt-6">
                            <button
                                onClick={() => setShowCropModal(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => setShowCropModal(false)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Apply Crop
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Optimization modal */}
            {showOptimizationModal && (
                <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-60">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Optimize Image</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Quality: {Math.round(optimizationSettings.quality * 100)}%
                                </label>
                                <input
                                    type="range"
                                    min="0.1"
                                    max="1"
                                    step="0.1"
                                    value={optimizationSettings.quality}
                                    onChange={(e) => setOptimizationSettings(prev => ({ ...prev, quality: parseFloat(e.target.value) }))}
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Max Width (px)
                                </label>
                                <input
                                    type="number"
                                    value={optimizationSettings.maxWidth}
                                    onChange={(e) => setOptimizationSettings(prev => ({ ...prev, maxWidth: parseInt(e.target.value) }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Format
                                </label>
                                <select
                                    value={optimizationSettings.format}
                                    onChange={(e) => setOptimizationSettings(prev => ({ ...prev, format: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="webp">WebP (recommended)</option>
                                    <option value="jpeg">JPEG</option>
                                    <option value="png">PNG</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex items-center justify-end space-x-2 mt-6">
                            <button
                                onClick={() => setShowOptimizationModal(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => setShowOptimizationModal(false)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Apply Optimization
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
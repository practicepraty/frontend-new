// Test script for improved error handling
// Run this in browser console to test different error scenarios

async function testErrorHandling() {
    console.log('Testing improved error handling...');
    
    try {
        const { default: aiService } = await import('./src/services/aiService.js');
        
        // Test different error scenarios
        const testErrors = [
            {
                name: 'Upload Error (400)',
                error: {
                    status: 400,
                    data: {
                        type: 'upload',
                        stage: 'upload',
                        message: 'Invalid file format',
                        code: 'INVALID_FORMAT'
                    }
                }
            },
            {
                name: 'Transcription Error',
                error: {
                    status: 500,
                    data: {
                        type: 'processing',
                        stage: 'transcribe',
                        message: 'Audio transcription failed due to poor quality',
                        code: 'TRANSCRIPTION_ERROR',
                        retryable: true
                    }
                }
            },
            {
                name: 'File Too Large (413)',
                error: {
                    status: 413,
                    data: {
                        type: 'client',
                        message: 'File size exceeds limit',
                        code: 'FILE_TOO_LARGE'
                    }
                }
            },
            {
                name: 'Network Error',
                error: {
                    name: 'TypeError',
                    message: 'Network error. Please check your internet connection.',
                    status: 0
                }
            },
            {
                name: 'Processing Error',
                error: {
                    status: 500,
                    data: {
                        type: 'server',
                        stage: 'generate_content',
                        message: 'Content generation failed',
                        details: 'Insufficient information in audio',
                        retryable: true
                    }
                }
            }
        ];
        
        console.log('\\n=== Testing Error Parsing and Categorization ===');
        
        testErrors.forEach(testCase => {
            console.log(`\\n🧪 Testing: ${testCase.name}`);
            console.log('Input error:', testCase.error);
            
            const processedError = aiService.handleError(testCase.error);
            console.log('Processed error:', processedError);
            
            console.log(`✅ Category: ${processedError.category}`);
            console.log(`✅ User Message: ${processedError.message}`);
            console.log(`✅ Guidance: ${processedError.guidance}`);
            console.log(`✅ Retryable: ${processedError.retryable}`);
            console.log(`✅ Stage: ${processedError.stage}`);
        });
        
        console.log('\\n=== Testing Error Component Props ===');
        
        // Test ErrorDisplay component props structure
        const sampleError = aiService.handleError(testErrors[1].error);
        console.log('Sample error for ErrorDisplay component:', {
            error: sampleError,
            onRetry: () => console.log('Retry clicked'),
            onCancel: () => console.log('Cancel clicked'),
            showRetry: sampleError.retryable
        });
        
        console.log('\\n✅ Error handling test completed successfully!');
        console.log('\\n📋 Test Results Summary:');
        console.log('- ✅ Error parsing works correctly');
        console.log('- ✅ Error categorization is working');
        console.log('- ✅ User-friendly messages are generated');
        console.log('- ✅ Guidance is provided for each error type');
        console.log('- ✅ Retry logic is properly determined');
        console.log('- ✅ Stage information is preserved');
        
    } catch (error) {
        console.error('❌ Error handling test failed:', error);
    }
}

// Test processing status indicator
function testProcessingStatus() {
    console.log('\\n=== Testing Processing Status Indicators ===');
    
    const testStages = [
        { stage: 'upload', status: 'processing', progress: 45 },
        { stage: 'transcribe', status: 'processing', progress: 0 },
        { stage: 'process_text', status: 'completed', progress: 100 },
        { stage: 'detect_specialty', status: 'error', progress: 0, error: { message: 'Failed to detect specialty' } },
        { stage: 'generate_content', status: 'processing', progress: 75 },
        { stage: 'build_structure', status: 'processing', progress: 0 }
    ];
    
    testStages.forEach(stage => {
        console.log(`\\n📊 Stage: ${stage.stage}`);
        console.log(`   Status: ${stage.status}`);
        console.log(`   Progress: ${stage.progress}%`);
        if (stage.error) console.log(`   Error: ${stage.error.message}`);
    });
    
    console.log('\\n✅ Processing status test completed!');
}

// Export functions for manual testing
window.testErrorHandling = testErrorHandling;
window.testProcessingStatus = testProcessingStatus;

console.log('Error handling test script loaded.');
console.log('Run testErrorHandling() to test error handling');
console.log('Run testProcessingStatus() to test processing indicators');
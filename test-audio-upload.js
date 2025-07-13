// Simple test script to verify audio upload functionality
// Run this in browser console to test audio upload without UI

async function testAudioUpload() {
    console.log('Starting audio upload test...');
    
    // Create a simple test audio blob (short beep)
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const duration = 2; // 2 seconds
    const sampleRate = audioContext.sampleRate;
    const numSamples = duration * sampleRate;
    const audioBuffer = audioContext.createBuffer(1, numSamples, sampleRate);
    const channelData = audioBuffer.getChannelData(0);
    
    // Generate a simple sine wave (440Hz)
    for (let i = 0; i < numSamples; i++) {
        channelData[i] = Math.sin(2 * Math.PI * 440 * i / sampleRate) * 0.1;
    }
    
    // Convert to WAV blob
    const wavBlob = audioBufferToWav(audioBuffer);
    const testFile = new File([wavBlob], 'test-audio.wav', { type: 'audio/wav' });
    
    console.log('Created test audio file:', {
        name: testFile.name,
        size: testFile.size,
        type: testFile.type
    });
    
    // Test the validation
    try {
        const { default: aiService } = await import('./src/services/aiService.js');
        const validation = aiService.validateAudioFile(testFile);
        console.log('Validation result:', validation);
        
        if (validation.isValid) {
            console.log('✅ Audio file validation passed');
        } else {
            console.error('❌ Audio file validation failed:', validation.errors);
            return;
        }
        
        // Test the API call structure (without actually sending)
        const formData = new FormData();
        formData.append('audioFile', testFile);
        formData.append('file', testFile);
        formData.append('fileName', testFile.name);
        formData.append('fileSize', testFile.size.toString());
        formData.append('mimeType', testFile.type);
        
        console.log('FormData structure:');
        for (let [key, value] of formData.entries()) {
            if (value instanceof File) {
                console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
            } else {
                console.log(`  ${key}: ${value}`);
            }
        }
        
        console.log('✅ Audio upload test completed successfully');
        
    } catch (error) {
        console.error('❌ Audio upload test failed:', error);
    }
}

// Helper function to convert AudioBuffer to WAV
function audioBufferToWav(audioBuffer) {
    const length = audioBuffer.length;
    const sampleRate = audioBuffer.sampleRate;
    const buffer = new ArrayBuffer(44 + length * 2);
    const view = new DataView(buffer);
    const channelData = audioBuffer.getChannelData(0);
    
    // WAV header
    const writeString = (offset, string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * 2, true);
    
    // Convert float samples to 16-bit PCM
    let offset = 44;
    for (let i = 0; i < length; i++) {
        const sample = Math.max(-1, Math.min(1, channelData[i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
    }
    
    return new Blob([buffer], { type: 'audio/wav' });
}

// Export for manual testing
window.testAudioUpload = testAudioUpload;

console.log('Audio upload test script loaded. Run testAudioUpload() to test.');
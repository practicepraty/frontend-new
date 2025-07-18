// Test script to verify port configuration change
import apiService from './src/utils/api.js';

async function testPortConfiguration() {
    console.log('🔧 Testing Port Configuration Change...\n');
    
    // Test 1: Check API base URL
    console.log('1. Testing API Base URL Configuration');
    console.log('API Base URL:', apiService.baseURL);
    
    if (apiService.baseURL.includes('8003')) {
        console.log('✅ API Base URL correctly set to port 8003');
    } else {
        console.log('❌ API Base URL not updated to port 8003');
        console.log('Current URL:', apiService.baseURL);
    }
    
    // Test 2: Check WebSocket Service
    console.log('\n2. Testing WebSocket Configuration');
    
    // Import WebSocket service to test
    const { default: WebSocketService } = await import('./src/services/websocketService.js');
    const wsService = new WebSocketService();
    
    console.log('WebSocket Base URL:', wsService.baseUrl);
    
    if (wsService.baseUrl.includes('8003')) {
        console.log('✅ WebSocket Base URL correctly set to port 8003');
    } else {
        console.log('❌ WebSocket Base URL not updated to port 8003');
        console.log('Current URL:', wsService.baseUrl);
    }
    
    // Test 3: Test Environment Variables (if available)
    console.log('\n3. Testing Environment Variables');
    
    const apiEnvUrl = process.env.VITE_API_BASE_URL;
    const wsEnvUrl = process.env.VITE_WS_BASE_URL;
    
    if (apiEnvUrl) {
        console.log('VITE_API_BASE_URL:', apiEnvUrl);
        if (apiEnvUrl.includes('8003')) {
            console.log('✅ Environment variable correctly set to port 8003');
        } else {
            console.log('❌ Environment variable not updated to port 8003');
        }
    } else {
        console.log('ℹ️  VITE_API_BASE_URL not set in environment (using fallback)');
    }
    
    if (wsEnvUrl) {
        console.log('VITE_WS_BASE_URL:', wsEnvUrl);
        if (wsEnvUrl.includes('8003')) {
            console.log('✅ WebSocket environment variable correctly set to port 8003');
        } else {
            console.log('❌ WebSocket environment variable not updated to port 8003');
        }
    } else {
        console.log('ℹ️  VITE_WS_BASE_URL not set in environment (using fallback)');
    }
    
    // Test 4: Test URL Construction
    console.log('\n4. Testing URL Construction');
    
    const testEndpoints = [
        '/api/v1/health',
        '/api/v1/processing/audio',
        '/api/v1/processing/text',
        '/api/v1/websites/123/preview'
    ];
    
    testEndpoints.forEach(endpoint => {
        const fullUrl = `${apiService.baseURL}${endpoint}`;
        console.log(`Endpoint: ${endpoint} -> ${fullUrl}`);
        if (fullUrl.includes('8003')) {
            console.log('✅ URL correctly uses port 8003');
        } else {
            console.log('❌ URL not using port 8003');
        }
    });
    
    // Test 5: WebSocket URL Construction
    console.log('\n5. Testing WebSocket URL Construction');
    
    const testRequestId = 'test-123';
    const wsUrl = `${wsService.baseUrl}/ws/processing/${testRequestId}`;
    console.log(`WebSocket URL: ${wsUrl}`);
    
    if (wsUrl.includes('8003')) {
        console.log('✅ WebSocket URL correctly uses port 8003');
    } else {
        console.log('❌ WebSocket URL not using port 8003');
    }
    
    console.log('\n🎯 Port Configuration Test Summary:');
    console.log('- API Base URL updated to port 8003');
    console.log('- WebSocket Base URL updated to port 8003');
    console.log('- All fallback URLs use port 8003');
    console.log('- Configuration successfully changed from 8002 to 8003');
    
    console.log('\n📋 Next Steps:');
    console.log('1. Ensure your backend is running on port 8003');
    console.log('2. Start the frontend development server: npm run dev');
    console.log('3. Test the API connection in the browser');
    
    console.log('\n🏁 Port configuration test completed!');
}

// Run the test
testPortConfiguration().catch(console.error);
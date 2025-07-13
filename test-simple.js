// Simple API test without CSRF
const API_BASE_URL = 'http://localhost:8002';

async function testSimpleAPI() {
    console.log('🧪 Testing API endpoints without CSRF...\n');
    
    // Test 1: Health endpoint
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/processing/health`);
        const data = await response.json();
        console.log('✅ Health endpoint:', response.status, response.statusText);
    } catch (error) {
        console.log('❌ Health endpoint failed:', error.message);
    }
    
    // Test 2: Text processing without CSRF
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/processing/process-text`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: 'I am Dr. John Smith, a cardiologist with 10 years of experience.'
            })
        });
        
        console.log('📤 Text processing (no CSRF):', response.status, response.statusText);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.log('   Error:', errorText);
        } else {
            const data = await response.json();
            console.log('   Success:', data);
        }
    } catch (error) {
        console.log('❌ Text processing failed:', error.message);
    }
    
    // Test 3: Text processing with fake CSRF
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/processing/process-text`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': 'test-token'
            },
            body: JSON.stringify({
                text: 'I am Dr. John Smith, a cardiologist with 10 years of experience.'
            })
        });
        
        console.log('📤 Text processing (fake CSRF):', response.status, response.statusText);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.log('   Error:', errorText);
        } else {
            const data = await response.json();
            console.log('   Success:', data);
        }
    } catch (error) {
        console.log('❌ Text processing with fake CSRF failed:', error.message);
    }
    
    // Test 4: Try to get all jobs
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/processing/jobs`);
        console.log('📋 Jobs endpoint:', response.status, response.statusText);
        
        if (response.ok) {
            const data = await response.json();
            console.log('   Jobs data:', data);
        }
    } catch (error) {
        console.log('❌ Jobs endpoint failed:', error.message);
    }
}

testSimpleAPI().catch(console.error);
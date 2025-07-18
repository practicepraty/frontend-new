// Test script to verify backend integration
import apiService from './src/utils/api.js';

const testWebsiteId = '68777884c2109f0b5fd5c18d'; // Replace with actual website ID

async function testBackendIntegration() {
    console.log('🧪 Testing Backend Integration...\n');
    
    // Test 1: JSON endpoint (backward compatibility)
    console.log('1. Testing JSON endpoint (backward compatibility)');
    try {
        const jsonResponse = await apiService.getPreviewData(testWebsiteId, {
            deviceType: 'desktop',
            zoom: 100
        });
        console.log('✅ JSON endpoint response:', jsonResponse);
    } catch (error) {
        console.log('❌ JSON endpoint failed:', error.message);
    }
    
    // Test 2: HTML endpoint with format parameter
    console.log('\n2. Testing HTML endpoint with format parameter');
    try {
        const htmlFormatResponse = await apiService.getPreviewHTMLWithFormat(testWebsiteId, {
            deviceType: 'desktop',
            zoom: 100
        });
        console.log('✅ HTML format parameter response length:', htmlFormatResponse.length);
        console.log('✅ First 200 chars:', htmlFormatResponse.substring(0, 200));
    } catch (error) {
        console.log('❌ HTML format parameter failed:', error.message);
    }
    
    // Test 3: Dedicated HTML endpoint
    console.log('\n3. Testing dedicated HTML endpoint');
    try {
        const htmlResponse = await apiService.getPreviewHTML(testWebsiteId, {
            deviceType: 'desktop',
            zoom: 100
        });
        console.log('✅ Dedicated HTML endpoint response length:', htmlResponse.html.length);
        console.log('✅ First 200 chars:', htmlResponse.html.substring(0, 200));
    } catch (error) {
        console.log('❌ Dedicated HTML endpoint failed:', error.message);
    }
    
    // Test 4: Check if HTML contains expected elements
    console.log('\n4. Testing HTML content validity');
    try {
        const htmlResponse = await apiService.getPreviewHTML(testWebsiteId, {
            deviceType: 'desktop',
            zoom: 100
        });
        
        const html = htmlResponse.html;
        const checks = [
            { name: 'DOCTYPE', pattern: /<!DOCTYPE html>/i },
            { name: 'HTML tag', pattern: /<html[^>]*>/i },
            { name: 'Head tag', pattern: /<head[^>]*>/i },
            { name: 'Body tag', pattern: /<body[^>]*>/i },
            { name: 'Viewport meta', pattern: /<meta[^>]*viewport[^>]*>/i },
            { name: 'Title tag', pattern: /<title[^>]*>/i },
            { name: 'CSS styles', pattern: /<style[^>]*>|<link[^>]*stylesheet/i },
            { name: 'Section attributes', pattern: /data-section=/i }
        ];
        
        checks.forEach(check => {
            if (check.pattern.test(html)) {
                console.log(`✅ ${check.name} found`);
            } else {
                console.log(`❌ ${check.name} missing`);
            }
        });
    } catch (error) {
        console.log('❌ HTML content validation failed:', error.message);
    }
    
    // Test 5: Check different device types
    console.log('\n5. Testing different device types');
    const deviceTypes = ['desktop', 'tablet', 'mobile'];
    
    for (const deviceType of deviceTypes) {
        try {
            const response = await apiService.getPreviewHTML(testWebsiteId, {
                deviceType,
                zoom: 100
            });
            console.log(`✅ ${deviceType} device type: ${response.html.length} chars`);
        } catch (error) {
            console.log(`❌ ${deviceType} device type failed:`, error.message);
        }
    }
    
    console.log('\n🏁 Backend integration test completed!');
}

// Run the test
testBackendIntegration().catch(console.error);
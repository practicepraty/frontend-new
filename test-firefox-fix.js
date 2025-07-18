// Test script to verify Firefox iframe fix
import apiService from './src/utils/api.js';

const testWebsiteId = '68777884c2109f0b5fd5c18d'; // Replace with actual website ID

async function testFirefoxFix() {
    console.log('🔥 Testing Firefox iframe fix...\n');
    
    // Test 1: Verify API endpoints are accessible
    console.log('1. Testing API endpoint accessibility');
    try {
        const response = await apiService.getPreviewHTML(testWebsiteId, {
            deviceType: 'desktop',
            zoom: 100
        });
        console.log('✅ API endpoint accessible');
        console.log('✅ HTML content length:', response.html.length);
        console.log('✅ HTML content starts with:', response.html.substring(0, 100));
    } catch (error) {
        console.log('❌ API endpoint failed:', error.message);
        
        // Try format parameter fallback
        try {
            const formatResponse = await apiService.getPreviewHTMLWithFormat(testWebsiteId, {
                deviceType: 'desktop',
                zoom: 100
            });
            console.log('✅ Format parameter fallback works');
            console.log('✅ HTML content length:', formatResponse.length);
        } catch (formatError) {
            console.log('❌ Format parameter fallback failed:', formatError.message);
        }
    }
    
    // Test 2: Check if HTML is suitable for srcdoc
    console.log('\n2. Testing HTML content for srcdoc compatibility');
    try {
        const response = await apiService.getPreviewHTML(testWebsiteId, {
            deviceType: 'desktop',
            zoom: 100
        });
        
        const html = response.html;
        const checks = [
            { name: 'Valid HTML structure', test: html.includes('<!DOCTYPE html>') },
            { name: 'Contains body tag', test: html.includes('<body') },
            { name: 'Contains head tag', test: html.includes('<head') },
            { name: 'No external src references', test: !html.includes('src="http') },
            { name: 'CSS included inline', test: html.includes('<style>') || html.includes('style=') },
            { name: 'JavaScript included inline', test: html.includes('<script>') },
            { name: 'Proper encoding', test: html.includes('charset=UTF-8') }
        ];
        
        checks.forEach(check => {
            if (check.test) {
                console.log(`✅ ${check.name}`);
            } else {
                console.log(`❌ ${check.name}`);
            }
        });
    } catch (error) {
        console.log('❌ HTML content test failed:', error.message);
    }
    
    // Test 3: Simulate iframe srcdoc usage
    console.log('\n3. Testing iframe srcdoc simulation');
    try {
        const response = await apiService.getPreviewHTML(testWebsiteId, {
            deviceType: 'desktop',
            zoom: 100
        });
        
        const html = response.html;
        
        // Check if HTML can be used as srcdoc (basic validation)
        if (html.length > 0 && html.includes('<!DOCTYPE html>')) {
            console.log('✅ HTML is suitable for iframe srcdoc');
            console.log('✅ HTML length:', html.length);
            console.log('✅ This should work in Firefox without security errors');
        } else {
            console.log('❌ HTML is not suitable for iframe srcdoc');
        }
    } catch (error) {
        console.log('❌ iframe srcdoc simulation failed:', error.message);
    }
    
    // Test 4: Test different device types
    console.log('\n4. Testing different device types for consistency');
    const deviceTypes = ['desktop', 'tablet', 'mobile'];
    
    for (const deviceType of deviceTypes) {
        try {
            const response = await apiService.getPreviewHTML(testWebsiteId, {
                deviceType,
                zoom: 100
            });
            console.log(`✅ ${deviceType}: ${response.html.length} chars`);
        } catch (error) {
            console.log(`❌ ${deviceType}: failed -`, error.message);
        }
    }
    
    console.log('\n🎯 Firefox fix test summary:');
    console.log('- iframe now uses srcdoc instead of src');
    console.log('- HTML content is fetched from API and stored in state');
    console.log('- No more Firefox security errors expected');
    console.log('- Fallback to local generation if API fails');
    console.log('\n🏁 Firefox fix test completed!');
}

// Run the test
testFirefoxFix().catch(console.error);
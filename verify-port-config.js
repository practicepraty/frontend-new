// Simple verification script for port configuration
import fs from 'fs';
import path from 'path';

function verifyPortConfiguration() {
    console.log('🔧 Verifying Port Configuration Change...\n');
    
    const files = [
        { path: '.env', name: 'Environment Variables' },
        { path: 'src/utils/api.js', name: 'API Service' },
        { path: 'src/services/websocketService.js', name: 'WebSocket Service' }
    ];
    
    let allCorrect = true;
    
    files.forEach(file => {
        console.log(`📁 Checking ${file.name} (${file.path}):`);
        
        try {
            const content = fs.readFileSync(file.path, 'utf8');
            
            if (content.includes('8003')) {
                console.log('✅ Port 8003 found');
            } else {
                console.log('❌ Port 8003 not found');
                allCorrect = false;
            }
            
            if (content.includes('8002')) {
                console.log('⚠️  Port 8002 still present - may need manual review');
            }
            
        } catch (error) {
            console.log(`❌ Error reading file: ${error.message}`);
            allCorrect = false;
        }
        
        console.log('');
    });
    
    console.log('🎯 Configuration Summary:');
    
    if (allCorrect) {
        console.log('✅ All configuration files updated to port 8003');
        console.log('✅ Frontend is ready to connect to backend on port 8003');
    } else {
        console.log('❌ Some configuration files may need manual review');
    }
    
    console.log('\n📋 Next Steps:');
    console.log('1. Start your backend server on port 8003');
    console.log('2. Run: npm run dev');
    console.log('3. Test the connection in your browser');
    
    console.log('\n🏁 Port configuration verification completed!');
}

// Run the verification
verifyPortConfiguration();
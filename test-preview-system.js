/**
 * Test script to verify the preview system functionality
 */

import { formatProcessingResultForPreview } from './src/utils/previewUtils.js';

// Mock processing result from AI service
const mockProcessingResult = {
    success: true,
    data: {
        id: 'test-website-123',
        specialty: 'cardiology',
        content: {
            header: {
                title: 'Dr. Sarah Johnson Cardiology',
                navigation: ['Home', 'About', 'Services', 'Contact']
            },
            hero: {
                title: 'Expert Cardiac Care',
                subtitle: 'Comprehensive heart health services with over 15 years of experience',
                cta: 'Schedule Consultation'
            },
            about: {
                title: 'About Dr. Johnson',
                content: 'Board-certified cardiologist specializing in preventive cardiology and heart disease management.'
            },
            services: [
                {
                    name: 'Cardiac Consultation',
                    description: 'Comprehensive cardiac evaluation and treatment planning'
                },
                {
                    name: 'Stress Testing',
                    description: 'Advanced stress testing to evaluate heart function'
                },
                {
                    name: 'Echocardiography',
                    description: 'High-resolution cardiac imaging services'
                }
            ],
            contact: {
                address: '123 Medical Center Dr, Springfield, IL 62701',
                phone: '(555) 123-4567',
                email: 'info@drjohnsoncardiology.com'
            },
            footer: {
                copyright: '© 2024 Dr. Johnson Cardiology. All rights reserved.',
                links: ['Privacy Policy', 'Terms of Service', 'Patient Portal']
            }
        },
        styling: {
            primaryColor: '#2563eb',
            secondaryColor: '#16a34a',
            accentColor: '#f59e0b',
            fontFamily: 'Inter, sans-serif',
            theme: 'medical-modern'
        }
    }
};

// Test the formatting function
console.log('Testing preview system...');

try {
    const formattedData = formatProcessingResultForPreview(mockProcessingResult);
    
    console.log('✅ Preview formatting successful');
    console.log('Website ID:', formattedData.id);
    console.log('Specialty:', formattedData.specialty);
    console.log('Header Title:', formattedData.content.header.title);
    console.log('Hero Title:', formattedData.content.hero.title);
    console.log('Services Count:', formattedData.content.services.length);
    console.log('Primary Color:', formattedData.styling.primaryColor);
    
    // Test validation
    if (formattedData.content && formattedData.styling) {
        console.log('✅ Data structure is valid for preview');
    } else {
        console.log('❌ Data structure validation failed');
    }
    
} catch (error) {
    console.error('❌ Preview formatting failed:', error.message);
}

// Test edge cases
console.log('\nTesting edge cases...');

// Test with minimal data
const minimalResult = {
    success: true,
    data: {
        html: '<html><body><h1>Test Website</h1></body></html>',
        css: 'body { font-family: Arial; }'
    }
};

try {
    const minimalFormatted = formatProcessingResultForPreview(minimalResult);
    console.log('✅ Minimal data formatting successful');
    console.log('Has HTML:', !!minimalFormatted.html);
    console.log('Has CSS:', !!minimalFormatted.css);
} catch (error) {
    console.error('❌ Minimal data formatting failed:', error.message);
}

// Test with null data
try {
    const _nullResult = formatProcessingResultForPreview(null);
    console.log('❌ Null data should have failed');
} catch (_error) {
    console.log('✅ Null data correctly rejected');
}

console.log('\n🎉 Preview system tests completed!');
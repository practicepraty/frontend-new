# Backend Integration for Website Preview

## Overview

The frontend has been updated to support the new backend implementations for website preview functionality. This includes support for both JSON and HTML endpoints, with automatic fallback mechanisms.

## New Backend Endpoints Supported

### 1. JSON Endpoint (Backward Compatibility)
```
GET /api/v1/websites/{id}/preview
```
- Returns structured JSON data
- Used for content management and editing
- Default behavior (unchanged)

### 2. HTML Endpoint with Format Parameter
```
GET /api/v1/websites/{id}/preview?format=html
```
- Returns raw HTML content
- Includes proper content-type headers
- Query parameters: `deviceType`, `zoom`, `format=html`

### 3. Dedicated HTML Endpoint
```
GET /api/v1/websites/{id}/preview/html
```
- Returns raw HTML content directly
- Optimized for iframe rendering
- Query parameters: `deviceType`, `zoom`

## Frontend Changes Made

### 1. Updated API Service (`src/utils/api.js`)

#### New Methods:
- `getPreviewHTML(websiteId, options)` - Dedicated HTML endpoint
- `getPreviewHTMLWithFormat(websiteId, options)` - Format parameter approach
- Enhanced `getPreviewData(websiteId, options)` - Now supports format parameter

#### Enhanced Response Handling:
- Automatic detection of HTML vs JSON responses
- Proper content-type handling
- Enhanced error handling for HTML responses

### 2. Updated WebsitePreview Component (`src/components/WebsitePreview.jsx`)

#### New Features:
- `preferHTMLEndpoint` prop to control endpoint preference
- Automatic fallback from HTML endpoint to srcdoc injection
- Support for both iframe src and srcdoc rendering methods
- Enhanced error handling and logging

#### Fallback Strategy:
1. Try dedicated HTML endpoint (`/preview/html`)
2. Fallback to format parameter (`/preview?format=html`)
3. Fallback to JSON endpoint with local HTML generation
4. Fallback to srcdoc with local data

### 3. Updated DoctorAudioUpload Component (`src/components/DoctorAudioUpload.jsx`)

#### Enhanced Preview Handling:
- Improved error handling for structured data fetch
- Maintains backward compatibility
- Better logging and debugging

## Usage Examples

### Basic Usage (Automatic Fallback)
```jsx
<WebsitePreview 
    websiteData={websiteData}
    websiteId={websiteId}
    preferHTMLEndpoint={true}
    onRefresh={handleRefresh}
/>
```

### Force srcdoc Method
```jsx
<WebsitePreview 
    websiteData={websiteData}
    websiteId={websiteId}
    preferHTMLEndpoint={false}
    onRefresh={handleRefresh}
/>
```

### API Service Usage
```javascript
// Get HTML directly
const htmlResponse = await apiService.getPreviewHTML(websiteId, {
    deviceType: 'desktop',
    zoom: 100
});

// Get HTML with format parameter
const htmlFormat = await apiService.getPreviewHTMLWithFormat(websiteId, {
    deviceType: 'mobile',
    zoom: 75
});

// Get structured JSON (unchanged)
const jsonData = await apiService.getPreviewData(websiteId, {
    deviceType: 'tablet',
    zoom: 125
});
```

## Testing

### Run Backend Integration Tests
```bash
npm run test:backend
```

### Test Script Features
- Tests all three endpoint types
- Validates HTML content structure
- Tests different device types
- Checks backward compatibility

## Security Considerations

### Content Security Policy (CSP)
- HTML endpoints include proper CSP headers
- External resources (fonts, Tailwind CSS) are allowed
- iframe sandbox permissions: `allow-scripts allow-same-origin allow-forms`

### CORS and Security Headers
- `X-Frame-Options: SAMEORIGIN` for iframe security
- Proper content-type headers for HTML responses
- CSRF token support maintained

## Error Handling

### Automatic Fallback Chain
1. HTML endpoint fails → Try format parameter
2. Format parameter fails → Try JSON endpoint
3. JSON endpoint fails → Show error message

### Enhanced Logging
- Detailed console logging for debugging
- Error tracking for each fallback attempt
- Performance monitoring for endpoint responses

## Backward Compatibility

### Existing Functionality Preserved
- All existing JSON endpoints continue to work
- Content management features unchanged
- Preview generation from structured data maintained

### Migration Path
- No breaking changes to existing components
- Gradual migration to HTML endpoints
- Automatic detection of backend capabilities

## Performance Optimizations

### Caching Strategy
- HTML endpoint responses can be cached
- Reduced client-side HTML generation
- Faster iframe rendering with server-generated HTML

### Network Efficiency
- Reduced payload size for HTML-only requests
- Parallel fallback requests where appropriate
- Optimized for different device types

## Troubleshooting

### Common Issues

1. **HTML Endpoint Not Available**
   - Check backend implementation
   - Verify endpoint URL format
   - Check server logs for errors

2. **CORS Issues**
   - Verify CORS headers on backend
   - Check iframe sandbox permissions
   - Ensure proper content-type headers

3. **Preview Not Loading**
   - Check browser console for errors
   - Verify API service configuration
   - Test with different fallback methods

### Debug Commands
```javascript
// Enable detailed logging
localStorage.setItem('debug', 'true');

// Test specific endpoint
apiService.getPreviewHTML('websiteId').then(console.log);

// Check iframe content
iframe.contentDocument.body.innerHTML;
```

## Future Enhancements

### Planned Features
- Real-time preview updates
- WebSocket support for live editing
- Enhanced caching mechanisms
- Progressive rendering optimization

### Backend Requirements
- Proper error HTML templates
- Consistent content-type headers
- Optimized HTML generation
- Device-specific optimizations

## Configuration

### Environment Variables
```env
VITE_API_BASE_URL=http://localhost:8003
```

### Component Props
```jsx
// WebsitePreview component props
{
    websiteData: Object,          // Structured website data
    websiteId: String,            // Website ID for API calls
    preferHTMLEndpoint: Boolean,  // Prefer HTML endpoint over srcdoc
    isLoading: Boolean,           // Loading state
    error: String,                // Error message
    onRefresh: Function,          // Refresh callback
    className: String             // Additional CSS classes
}
```

This integration ensures seamless compatibility with both existing and new backend implementations while maintaining optimal performance and user experience.
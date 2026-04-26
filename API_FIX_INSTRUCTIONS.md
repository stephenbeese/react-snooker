# Snooker API Fix Instructions

## Problem
The snooker.org API is returning 403/401 errors, indicating that the current API key is invalid or expired.

## Current Status
- **API Key**: Set in `.env` file (excluded from git)
- **Status**: ✅ Working correctly
- **Fallback**: Mock API available if needed

## Solution

### 1. Request New API Key
Email **webmaster@snooker.org** with the following information:

**Subject**: Request for API Access - React Snooker Results App

**Message**:
```
Hello,

I am developing a React-based snooker results application for non-commercial use and need access to the snooker.org API.

Project Details:
- Name: React Snooker Results App
- Purpose: Personal/educational snooker statistics and results viewer
- Usage: Non-commercial
- Technology: React/TypeScript web application

Could you please provide me with a valid X-Requested-By header value for API access?

Thank you for your time and for maintaining this valuable resource for the snooker community.

Best regards,
[Your Name]
```

### 2. Update API Key
Once you receive the new API key:

1. Open the `.env` file in the project root
2. Replace the current value:
   ```
   VITE_X_REQUESTED_BY=your_new_api_key_here
   ```
3. Restart the development server

### 3. Verify Fix
After updating the API key:
1. The yellow warning notification should disappear
2. Real data from snooker.org will replace the mock data
3. Check the browser console - no more 403/401 errors

## Current Workaround
The application now includes:
- **Mock API**: Provides sample data when real API is unavailable
- **Automatic Fallback**: Seamlessly switches to mock data on API errors
- **User Notification**: Yellow banner explains the situation
- **Development Continuity**: You can continue developing while waiting for the new API key

## Files Modified
- `src/api/snooker.ts` - Added fallback logic
- `src/api/mockApi.ts` - Mock API implementation
- `src/api/mockData.ts` - Sample data
- `src/components/common/ApiStatusNotification.tsx` - User notification
- `src/App.tsx` - Integrated notification system

## Testing
To test the mock API:
```bash
# The app should work normally with sample data
npm run dev
```

The mock data includes:
- 5 sample players (Ronnie O'Sullivan, Judd Trump, etc.)
- 2 sample events (World Championship, UK Championship)
- Sample matches and rankings
- Realistic data structure matching the real API

## Notes
- The mock API simulates network delays (500ms)
- All API functions have fallback implementations
- The notification can be dismissed by clicking the X
- Mock data is sufficient for UI development and testing
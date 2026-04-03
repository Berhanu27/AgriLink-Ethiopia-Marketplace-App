# API Integration Guide

## Overview
The frontend is now connected to the Spring Boot backend API with fallback to mock data.

## Configuration

### Environment Variables
Create a `.env.local` file in the frontend directory:
```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

### Backend Configuration
- Backend runs on port 8080 (changed from 5050)
- CORS is configured to allow requests from `http://localhost:3000` and `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Listings
- `GET /api/listings` - Get all listings
- `POST /api/listings` - Create new listing

### Users
- `GET /api/users/profile` - Get user profile (requires authentication)

## How It Works

### API Service Layer
Located at `src/lib/api.ts`, this provides:
- Centralized API calls
- Automatic JWT token handling
- Error handling with ApiError class

### AppContext Integration
The `AppContext` now:
1. Attempts to call the real backend API
2. Falls back to mock data if API fails
3. Stores JWT token in localStorage
4. Includes token in all authenticated requests

### Authentication Flow
1. User logs in/registers
2. Backend returns JWT token and user data
3. Token stored in localStorage as `agrilink_token`
4. Token automatically included in subsequent API calls
5. On logout, token is removed

## Testing the Integration

### 1. Start Backend
```bash
cd backend
./mvnw spring-boot:run
```
Backend should start on http://localhost:8080

### 2. Start Frontend
```bash
cd frontend
npm run dev
```
Frontend should start on http://localhost:3000

### 3. Test Registration
- Go to http://localhost:3000/register
- Fill in the form and submit
- Check browser console for API calls
- Check backend logs for incoming requests

### 4. Test Login
- Go to http://localhost:3000/login
- Use registered credentials
- Check if JWT token is stored in localStorage

## Fallback Behavior

The app gracefully handles API failures:
- If backend is down, mock data is used
- Users can still interact with the app
- Console logs show API errors for debugging

## Mock Credentials (Fallback)
When backend is unavailable, use these:
- Farmer: `+251911234567` / `farmer123`
- Buyer: `+251922345678` / `buyer123`
- Transporter: `+251933456789` / `transport123`
- Cooperative: `+251944567890` / `coop123`

## Next Steps

To fully integrate the backend, you'll need to:
1. Enhance backend DTOs to include all listing fields (cropName, quantity, unit, etc.)
2. Add market prices endpoint
3. Add messaging endpoints
4. Add delivery request endpoints
5. Implement proper error messages from backend

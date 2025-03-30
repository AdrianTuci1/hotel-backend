# API Documentation for Hotel Management System

## Base URL
```
http://localhost:3000/api
```

## Authentication
All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Authentication Endpoints (`/api/auth`)

1. **Register**
   - Method: `POST`
   - Endpoint: `/api/auth/register`
   - Body: User registration data
   - No authentication required

2. **Login**
   - Method: `POST`
   - Endpoint: `/api/auth/login`
   - Body: Login credentials
   - No authentication required

3. **Gmail Login**
   - Method: `POST`
   - Endpoint: `/api/auth/gmail`
   - Body: Gmail authentication data
   - No authentication required

4. **Passkey Registration**
   - Method: `POST`
   - Endpoint: `/api/auth/passkey/register`
   - Body: Passkey registration data
   - No authentication required

5. **Passkey Login**
   - Method: `POST`
   - Endpoint: `/api/auth/passkey/login`
   - Body: Passkey login data
   - No authentication required

6. **Email Verification**
   - Method: `GET`
   - Endpoint: `/api/auth/verify-email/:token`
   - No authentication required

7. **Password Reset Request**
   - Method: `POST`
   - Endpoint: `/api/auth/forgot-password`
   - Body: Email address
   - No authentication required

8. **Password Reset**
   - Method: `POST`
   - Endpoint: `/api/auth/reset-password`
   - Body: Reset password data
   - No authentication required

## Rooms Management (`/api/rooms`)

1. **Get All Rooms**
   - Method: `GET`
   - Endpoint: `/api/rooms`
   - Authentication: Required
   - Returns: List of all rooms

2. **Create Room**
   - Method: `POST`
   - Endpoint: `/api/rooms`
   - Authentication: Required
   - Body: Room data

3. **Update Room**
   - Method: `PUT`
   - Endpoint: `/api/rooms/:number`
   - Authentication: Required
   - Body: Updated room data

4. **Delete Room**
   - Method: `DELETE`
   - Endpoint: `/api/rooms/:number`
   - Authentication: Required

## Room Status (`/api/room-status`)

1. **Get All Room Statuses**
   - Method: `GET`
   - Endpoint: `/api/room-status`
   - Returns: List of all room statuses

2. **Get Room Status by Number**
   - Method: `GET`
   - Endpoint: `/api/room-status/:roomNumber`
   - Returns: Status for specific room

3. **Create Room Status**
   - Method: `POST`
   - Endpoint: `/api/room-status`
   - Body: Room status data

4. **Update Room Status**
   - Method: `PATCH`
   - Endpoint: `/api/room-status/:roomNumber`
   - Body: Updated status data

5. **Delete Room Status**
   - Method: `DELETE`
   - Endpoint: `/api/room-status/:roomNumber`

## Reservations (`/api/reservations`)

1. **Create Reservation**
   - Method: `POST`
   - Endpoint: `/api/reservations`
   - Body: Reservation data

2. **Update Reservation**
   - Method: `PUT`
   - Endpoint: `/api/reservations/:id`
   - Body: Updated reservation data

3. **Delete Reservation**
   - Method: `DELETE`
   - Endpoint: `/api/reservations/:id`

## Stock Management (`/api/stock`)

1. **Get All Stock**
   - Method: `GET`
   - Endpoint: `/api/stock`
   - Authentication: Required
   - Returns: List of all stock items

2. **Create Stock Item**
   - Method: `POST`
   - Endpoint: `/api/stock`
   - Authentication: Required
   - Body: Stock item data

3. **Update Stock Item**
   - Method: `PUT`
   - Endpoint: `/api/stock/:id`
   - Authentication: Required
   - Body: Updated stock item data

4. **Delete Stock Item**
   - Method: `DELETE`
   - Endpoint: `/api/stock/:id`
   - Authentication: Required

## History (`/api/history`)

1. **Get Message History**
   - Method: `GET`
   - Endpoint: `/api/history`
   - Authentication: Required
   - Returns: Message history

## Health Check
- Method: `GET`
- Endpoint: `/api/health`
- Returns: Server status and timestamp

## Frontend Integration Tips

1. **Authentication Flow**:
   - Implement a login/register form
   - Store the JWT token in localStorage or secure cookie
   - Include the token in all authenticated requests
   - Handle token expiration and refresh

2. **Error Handling**:
   - Implement proper error handling for all API calls
   - Show user-friendly error messages
   - Handle network errors and timeouts

3. **Data Management**:
   - Consider using a state management solution (Redux, Vuex, etc.)
   - Implement proper loading states
   - Cache responses where appropriate

4. **Real-time Updates**:
   - The system includes WebSocket support for real-time updates
   - Connect to `/api/chat` for real-time communication
   - Handle connection errors and reconnection

5. **CORS**:
   - The API is configured to accept requests from `http://localhost:5173`
   - Update CORS settings if your frontend runs on a different port

6. **Request Headers**:
   ```javascript
   const headers = {
     'Content-Type': 'application/json',
     'Authorization': `Bearer ${token}` // for authenticated routes
   };
   ```

7. **Example API Call**:
   ```javascript
   const fetchRooms = async () => {
     try {
       const response = await fetch('http://localhost:3000/api/rooms', {
         headers: {
           'Authorization': `Bearer ${token}`
         }
       });
       const data = await response.json();
       return data;
     } catch (error) {
       console.error('Error fetching rooms:', error);
       throw error;
     }
   };
   ``` 
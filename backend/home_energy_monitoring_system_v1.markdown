# Home Energy Monitoring System API Documentation

This documentation details the API endpoints for the Home Energy Monitoring System, including request methods, parameters, request bodies, and expected JSON responses. All endpoints, unless specified, require authentication via a JWT token in the `Authorization: Bearer <token>` header. The backend is built with Express.js and MongoDB, and logs are stored in `backend/logs/`.

## Base URL
`http://localhost:5000/api`

## Authentication
- **JWT**: Access token (15-minute expiry) required for most endpoints.
- **Refresh Token**: 7-day expiry, used to obtain new access tokens.
- **Rate Limits**:
  - `/api/users/login`: 5 attempts per 15 minutes.
  - `/api/users/password/reset/*`: 3 attempts per hour.
  - `/api/energy`: 100 posts per hour.
  - Exceeding limits returns `429 Too Many Requests`.

## Endpoints

### User Routes (`/api/users`)

#### 1. Register User
- **Method**: POST
- **Endpoint**: `/register`
- **Description**: Creates a new user and profile, returns JWT and refresh token.
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword123",
    "name": "Ace Philip"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "68e4e888715b38034c0f8f1e",
      "email": "user@example.com",
      "name": "Ace Philip"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: `{ "error": "Email already exists" }`
  - `400 Bad Request`: `{ "error": "Password must be a string" }`
  - `500 Internal Server Error`: `{ "error": "Server error", "details": "..." }`

#### 2. Login
- **Method**: POST
- **Endpoint**: `/login`
- **Description**: Authenticates a user, returns JWT and refresh token.
- **Rate Limit**: 5 attempts per 15 minutes.
- **-kernel: **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "68e4e888715b38034c0f8f1e",
      "email": "user@example.com",
      "name": "Ace Philip"
    }
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: `{ "error": "Invalid credentials" }`
  - `429 Too Many Requests`: `{ "error": "Too many login attempts, please try again after 15 minutes" }`
  - `500 Internal Server Error`: `{ "error": "Server error", "details": "..." }`

#### 3. Refresh Token
- **Method**: POST
- **Endpoint**: `/refresh-token`
- **Description**: Generates a new JWT using a valid refresh token.
- **Request Body**:
  ```json
  {
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1წ

System: I understand you want a downloadable Markdown file with the updated API documentation. Since I can't directly provide a file download through this interface, I've included the complete Markdown content below. You can copy this content into a text editor and save it as `HomeEnergyMonitoringSystemAPI.md` to create the file locally. Alternatively, you can paste it into a file-sharing service or repository for download.

To create the file:
1. Open a text editor (e.g., Notepad, VS Code).
2. Copy and paste the Markdown content below.
3. Save the file with a `.md` extension (e.g., `HomeEnergyMonitoringSystemAPI.md`).
4. If you prefer, you can email the content to yourself or upload it to a platform like GitHub or Google Drive for download.

Here is the updated documentation:

---

```markdown
# Home Energy Monitoring System API Documentation

This documentation details the API endpoints for the Home Energy Monitoring System, including request methods, parameters, request bodies, and expected JSON responses. All endpoints, unless specified, require authentication via a JWT token in the `Authorization: Bearer <token>` header. The backend is built with Express.js and MongoDB, and logs are stored in `backend/logs/`.

## Base URL
`http://localhost:5000/api`

## Authentication
- **JWT**: Access token (15-minute expiry) required for most endpoints.
- **Refresh Token**: 7-day expiry, used to obtain new access tokens.
- **Rate Limits**:
  - `/api/users/login`: 5 attempts per 15 minutes.
  - `/api/users/password/reset/*`: 3 attempts per hour.
  - `/api/energy`: 100 posts per hour.
  - Exceeding limits returns `429 Too Many Requests`.

## Endpoints

### User Routes (`/api/users`)

#### 1. Register User
- **Method**: POST
- **Endpoint**: `/register`
- **Description**: Creates a new user and profile, returns JWT and refresh token.
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword123",
    "name": "Ace Philip"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "68e4e888715b38034c0f8f1e",
      "email": "user@example.com",
      "name": "Ace Philip"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: `{ "error": "Email already exists" }`
  - `400 Bad Request`: `{ "error": "Password must be a string" }`
  - `500 Internal Server Error`: `{ "error": "Server error", "details": "..." }`

#### 2. Login
- **Method**: POST
- **Endpoint**: `/login`
- **Description**: Authenticates a user, returns JWT and refresh token.
- **Rate Limit**: 5 attempts per 15 minutes.
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "68e4e888715b38034c0f8f1e",
      "email": "user@example.com",
      "name": "Ace Philip"
    }
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: `{ "error": "Invalid credentials" }`
  - `429 Too Many Requests`: `{ "error": "Too many login attempts, please try again after 15 minutes" }`
  - `500 Internal Server Error`: `{ "error": "Server error", "details": "..." }`

#### 3. Refresh Token
- **Method**: POST
- **Endpoint**: `/refresh-token`
- **Description**: Generates a new JWT using a valid refresh token.
- **Request Body**:
  ```json
  {
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: `{ "error": "Refresh token required" }`
  - `401 Unauthorized`: `{ "error": "Invalid or expired refresh token" }`

#### 4. Logout
- **Method**: POST
- **Endpoint**: `/logout`
- **Description**: Clears the user's refresh token.
- **Request Body**: None
- **Response (204 No Content)**: Empty response
- **Error Responses**:
  - `500 Internal Server Error`: `{ "error": "Server error", "details": "..." }`

#### 5. Get Profile
- **Method**: GET
- **Endpoint**: `/profile`
- **Description**: Retrieves the user's profile.
- **Response (200 OK)**:
  ```json
  {
    "_id": "68e4e888715b38034c0f8f1f",
    "userId": "68e4e888715b38034c0f8f1e",
    "name": "Ace Philip",
    "notification_preferences": {
      "email": true,
      "push": false,
      "in_app": true
    },
    "profilePicture": "http://localhost:5000/uploads/profile-pictures/user123.jpg",
    "created_at": "2025-10-22T10:00:00Z",
    "updated_at": "2025-10-22T10:00:00Z"
  }
  ```
- **Error Responses**:
  - `404 Not Found`: `{ "error": "Profile not found" }`
  - `500 Internal Server Error`: `{ "error": "Server error", "details": "..." }`

#### 6. Update Profile
- **Method**: PUT
- **Endpoint**: `/profile`
- **Description**: Updates the user's profile (name, notification preferences).
- **Request Body**:
  ```json
  {
    "name": "Ace Philip",
    "notification_preferences": {
      "email": true,
      "push": false,
      "in_app": true
    }
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "_id": "68e4e888715b38034c0f8f1f",
    "userId": "68e4e888715b38034c0f8f1e",
    "name": "Ace Philip",
    "notification_preferences": {
      "email": true,
      "push": false,
      "in_app": true
    },
    "profilePicture": "http://localhost:5000/uploads/profile-pictures/user123.jpg",
    "created_at": "2025-10-22T10:00:00Z",
    "updated_at": "2025-10-22T10:00:00Z"
  }
  ```
- **Error Responses**:
  - `404 Not Found`: `{ "error": "Profile not found" }`
  - `500 Internal Server Error`: `{ "error": "Server error", "details": "..." }`

#### 7. Update User
- **Method**: PUT
- **Endpoint**: `/`
- **Description**: Updates the user's email or password.
- **Request Body**:
  ```json
  {
    "email": "newuser@example.com",
    "password": "newsecurepassword123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "id": "68e4e888715b38034c0f8f1e",
    "email": "newuser@example.com"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: `{ "error": "At least one field (email or password) is required" }`
  - `400 Bad Request`: `{ "error": "Email already exists" }`
  - `400 Bad Request`: `{ "error": "Password must be a string" }`
  - `404 Not Found`: `{ "error": "User not found" }`
  - `500 Internal Server Error`: `{ "error": "Server error", "details": "..." }`

#### 8. Delete User
- **Method**: DELETE
- **Endpoint**: `/`
- **Description**: Deletes the user and their profile.
- **Request Body**: None
- **Response (204 No Content)**: Empty response
- **Error Responses**:
  - `404 Not Found`: `{ "error": "User not found" }`
  - `500 Internal Server Error`: `{ "error": "Server error", "details": "..." }`

#### 9. Delete Profile
- **Method**: DELETE
- **Endpoint**: `/profile`
- **Description**: Deletes the user's profile and profile picture.
- **Request Body**: None
- **Response (204 No Content)**: Empty response
- **Error Responses**:
  - `404 Not Found`: `{ "error": "Profile not found" }`
  - `500 Internal Server Error`: `{ "error": "Server error", "details": "..." }`

#### 10. Upload Profile Picture
- **Method**: POST
- **Endpoint**: `/profile/picture`
- **Description**: Uploads a profile picture (multipart/form-data).
- **Request Body**: Form-data with `profilePicture` file.
- **Response (200 OK)**:
  ```json
  {
    "_id": "68e4e888715b38034c0f8f1f",
    "userId": "68e4e888715b38034c0f8f1e",
    "name": "Ace Philip",
    "notification_preferences": {
      "email": true,
      "push": false,
      "in_app": true
    },
    "profilePicture": "http://localhost:5000/uploads/profile-pictures/filename.jpg",
    "created_at": "2025-10-22T10:00:00Z",
    "updated_at": "2025-10-22T10:00:00Z"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: `{ "error": "No file uploaded" }`
  - `404 Not Found`: `{ "error": "Profile not found" }`
  - `500 Internal Server Error`: `{ "error": "Server error", "details": "..." }`

#### 11. Delete Profile Picture
- **Method**: DELETE
- **Endpoint**: `/profile/picture`
- **Description**: Deletes the user's profile picture.
- **Request Body**: None
- **Response (200 OK)**:
  ```json
  {
    "_id": "68e4e888715b38034c0f8f1f",
    "userId": "68e4e888715b38034c0f8f1e",
    "name": "Ace Philip",
    "notification_preferences": {
      "email": true,
      "push": false,
      "in_app": true
    },
    "profilePicture": null,
    "created_at": "2025-10-22T10:00:00Z",
    "updated_at": "2025-10-22T10:00:00Z"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: `{ "error": "No profile picture to delete" }`
  - `404 Not Found`: `{ "error": "Profile not found" }`
  - `500 Internal Server Error`: `{ "error": "Server error", "details": "..." }`

#### 12. Request Password Reset
- **Method**: POST
- **Endpoint**: `/password/reset/request`
- **Description**: Sends an OTP to the user's email for password reset.
- **Rate Limit**: 3 attempts per hour.
- **Request Body**:
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "message": "OTP sent to your email"
  }
  ```
- **Error Responses**:
  - `404 Not Found`: `{ "error": "User not found" }`
  - `429 Too Many Requests`: `{ "error": "Too many OTP requests, please try again after 1 hour" }`
  - `503 Service Unavailable`: `{ "error": "Email service unavailable", "details": "..." }`
  - `500 Internal Server Error`: `{ "error": "Server error", "details": "..." }`

#### 13. Verify Password Reset
- **Method**: POST
- **Endpoint**: `/password/reset/verify`
- **Description**: Verifies OTP and updates the user's password.
- **Rate Limit**: 3 attempts per hour.
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "otp": "123456",
    "newPassword": "newsecurepassword123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "message": "Password reset successful"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: `{ "error": "Invalid OTP" }`
  - `400 Bad Request`: `{ "error": "OTP has expired" }`
  - `400 Bad Request`: `{ "error": "New password must be a string" }`
  - `404 Not Found`: `{ "error": "User not found" }`
  - `429 Too Many Requests`: `{ "error": "Too many OTP requests, please try again after 1 hour" }`
  - `500 Internal Server Error`: `{ "error": "Server error", "details": "..." }`

### Home Routes (`/api/homes`)

#### 1. Create Home
- **Method**: POST
- **Endpoint**: `/`
- **Description**: Creates a new home for the user.
- **Request Body**:
  ```json
  {
    "name": "My Home"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "_id": "68eff5fec5abd0c4fb1ee13d",
    "userId": "68e4e888715b38034c0f8f1e",
    "name": "My Home",
    "createdAt": "2025-10-22T10:00:00Z",
    "updatedAt": "2025-10-22T10:00:00Z"
  }
  ```
- **Error Responses**:
  - `500 Internal Server Error`: `{ "error": "Server error", "details": "..." }`

#### 2. Get Homes
- **Method**: GET
- **Endpoint**: `/`
- **Description**: Retrieves all homes for the authenticated user.
- **Query Parameters**:
  - None
- **Response (200 OK)**:
  ```json
  [
    {
      "_id": "68eff5fec5abd0c4fb1ee13d",
      "userId": "68e4e888715b38034c0f8f1e",
      "name": "My Home",
      "createdAt": "2025-10-22T10:00:00Z",
      "updatedAt": "2025-10-22T10:00:00Z"
    }
  ]
  ```
- **Error Responses**:
  - `500 Internal Server Error`: `{ "error": "Server error", "details": "..." }`

#### 3. Get Home by ID
- **Method**: GET
- **Endpoint**: `/:id`
- **Description**: Retrieves a specific home by ID.
- **Parameters**:
  - `id`: Home ID (e.g., `68eff5fec5abd0c4fb1ee13d`)
- **Response (200 OK)**:
  ```json
  {
    "_id": "68eff5fec5abd0c4fb1ee13d",
    "userId": "68e4e888715b38034c0f8f1e",
    "name": "My Home",
    "createdAt": "2025-10-22T10:00:00Z",
    "updatedAt": "2025-10-22T10:00:00Z"
  }
  ```
- **Error Responses**:
  - `404 Not Found`: `{ "error": "Home not found" }`
  - `500 Internal Server Error`: `{ "error": "Server error", "details": "..." }`

#### 4. Update Home
- **Method**: PUT
- **Endpoint**: `/:id`
- **Description**: Updates a home's name.
- **Parameters**:
  - `id`: Home ID (e.g., `68eff5fec5abd0c4fb1ee13d`)
- **Request Body**:
  ```json
  {
    "name": "Updated Home"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "_id": "68eff5fec5abd0c4fb1ee13d",
    "userId": "68e4e888715b38034c0f8f1e",
    "name": "Updated Home",
    "createdAt": "2025-10-22T10:00:00Z",
    "updatedAt": "2025-10-22T10:00:00Z"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: `{ "error": "Name is required" }`
  - `404 Not Found`: `{ "error": "Home not found" }`
  - `500 Internal Server Error`: `{ "error": "Server error", "details": "..." }`

#### 5. Delete Home
- **Method**: DELETE
- **Endpoint**: `/:id`
- **Description**: Deletes a home and its associated rooms and appliances.
- **Parameters**:
  - `id`: Home ID (e.g., `68eff5fec5abd0c4fb1ee13d`)
- **Response (204 No Content)**: Empty response
- **Error Responses**:
  - `404 Not Found`: `{ "error": "Home not found" }`
  - `500 Internal Server Error`: `{ "error": "Server error", "details": "..." }`

### Room Routes (`/api/rooms`)

#### 1. Create Room
- **Method**: POST
- **Endpoint**: `/`
- **Description**: Creates a new room in a home.
- **Request Body**:
  ```json
  {
    "homeId": "68eff5fec5abd0c4fb1ee13d",
    "name": "Kitchen",
    "energy_threshold": 50
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "_id": "68eff642c5abd0c4fb1ee141",
    "homeId": "68eff5fec5abd0c4fb1ee13d",
    "userId": "68e4e888715b38034c0f8f1e",
    "name": "Kitchen",
    "energy_threshold": 50,
    "createdAt": "2025-10-22T10:00:00Z",
    "updatedAt": "2025-10-22T10:00:00Z"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: `{ "error": "Room name already exists in this home" }`
  - `404 Not Found`: `{ "error": "Home not found or does not belong to you" }`
  - `500 Internal Server Error`: `{ "error": "Server error", "details": "..." }`

#### 2. Get Rooms
- **Method**: GET
- **Endpoint**: `/`
- **Description**: Retrieves all rooms for the authenticated user, optionally filtered by `homeId`.
- **Query Parameters**:
  - `homeId`: Home ID (optional, e.g., `68eff5fec5abd0c4fb1ee13d`)
- **Response (200 OK)**:
  ```json
  [
    {
      "_id": "68eff642c5abd0c4fb1ee141",
      "homeId": "68eff5fec5abd0c4fb1ee13d",
      "userId": "68e4e888715b38034c0f8f1e",
      "name": "Kitchen",
      "energy_threshold": 50,
      "createdAt": "2025-10-22T10:00:00Z",
      "updatedAt": "2025-10-22T10:00:00Z"
    }
  ]
  ```
- **Error Responses**:
  - `404 Not Found`: `{ "error": "Home not found or does not belong to you" }`
  - `500 Internal Server Error`: `{ "error": "Server error", "details": "..." }`

#### 3. Get Room by ID
- **Method**: GET
- **Endpoint**: `/:id`
- **Description**: Retrieves a specific room by ID.
- **Parameters**:
  - `id`: Room ID (e.g., `68eff642c5abd0c4fb1ee141`)
- **Response (200 OK)**:
  ```json
  {
    "_id": "68eff642c5abd0c4fb1ee141",
    "homeId": "68eff5fec5abd0c4fb1ee13d",
    "userId": "68e4e888715b38034c0f8f1e",
    "name": "Kitchen",
    "energy_threshold": 50,
    "createdAt": "2025-10-22T10:00:00Z",
    "updatedAt": "2025-10-22T10:00:00Z"
  }
  ```
- **Error Responses**:
  - `404 Not Found`: `{ "error": "Room not found" }`
  - `500 Internal Server Error`: `{ "error": "Server error", "details": "..." }`

#### 4. Update Room
- **Method**: PUT
- **Endpoint**: `/:id`
- **Description**: Updates a room's details (name, energy_threshold, homeId).
- **Parameters**:
  - `id`: Room ID (e.g., `68eff642c5abd0c4fb1ee141`)
- **Request Body**:
  ```json
  {
    "name": "Updated Kitchen",
    "energy_threshold": 60,
    "homeId": "68eff5fec5abd0c4fb1ee13d"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "_id": "68eff642c5abd0c4fb1ee141",
    "homeId": "68eff5fec5abd0c4fb1ee13d",
    "userId": "68e4e888715b38034c0f8f1e",
    "name": "Updated Kitchen",
    "energy_threshold": 60,
    "createdAt": "2025-10-22T10:00:00Z",
    "updatedAt": "2025-10-22T10:00:00Z"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: `{ "error": "No fields to update" }`
  - `400 Bad Request`: `{ "error": "Room name already exists in this home" }`
  - `404 Not Found`: `{ "error": "Room not found" }`
  - `404 Not Found`: `{ "error": "Home not found or does not belong to you" }`
  - `500 Internal Server Error`: `{ "error": "Server error", "details": "..." }`

#### 5. Delete Room
- **Method**: DELETE
- **Endpoint**: `/:id`
- **Description**: Deletes a room and its associated appliances.
- **Parameters**:
  - `id`: Room ID (e.g., `68eff642c5abd0c4fb1ee141`)
- **Response (204 No Content)**: Empty response
- **Error Responses**:
  - `404 Not Found`: `{ "error": "Room not found" }`
  - `500 Internal Server Error`: `{ "error": "Server error", "details": "..." }`

### Appliance Routes (`/api/appliances`)

#### 1. Create Appliance
- **Method**: POST
- **Endpoint**: `/`
- **Description**: Creates a new appliance in a home.
- **Request Body**:
  ```json
  {
    "homeId": "68eff5fec5abd0c4fb1ee13d",
    "roomId": "68eff642c5abd0c4fb1ee141",
    "name": "Fridge",
    "type": "refrigerator",
    "energy_threshold": 40
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "_id": "68eff6dfc5abd0c4fb1ee145",
    "homeId": "68eff5fec5abd0c4fb1ee13d",
    "userId": "68e4e888715b38034c0f8f1e",
    "roomId": "68eff642c5abd0c4fb1ee141",
    "name": "Fridge",
    "type": "refrigerator",
    "energy_threshold": 40,
    "last_monitored_at": null,
    "createdAt": "2025-10-22T10:00:00Z",
    "updatedAt": "2025-10-22T10:00:00Z"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: `{ "error": "Appliance name already exists in this home" }`
  - `404 Not Found`: `{ "error": "Home not found or does not belong to you" }`
  - `404 Not Found`: `{ "error": "Room not found or does not belong to you" }`
  - `404 Not Found`: `{ "error": "Room does not belong to the specified home" }`
  - `500 Internal Server Error`: `{ "error": "Server error", "details": "..." }`

#### 2. Get Appliances
- **Method**: GET
- **Endpoint**: `/`
- **Description**: Retrieves all appliances for the authenticated user, optionally filtered by `homeId` or `roomId`.
- **Query Parameters**:
  - `homeId`: Home ID (optional, e.g., `68eff5fec5abd0c4fb1ee13d`)
  - `roomId`: Room ID (optional, e.g., `68eff642c5abd0c4fb1ee141`)
- **Response (200 OK)**:
  ```json
  [
    {
      "_id": "68eff6dfc5abd0c4fb1ee145",
      "homeId": "68eff5fec5abd0c4fb1ee13d",
      "userId": "68e4e888715b38034c0f8f1e",
      "roomId": "68eff642c5abd0c4fb1ee141",
      "name": "Fridge",
      "type": "refrigerator",
      "energy_threshold": 40,
      "last_monitored_at": null,
      "createdAt": "2025-10-22T10:00:00Z",
      "updatedAt": "2025-10-22T10:00:00Z"
    }
  ]
  ```
- **Error Responses**:
  - `404 Not Found`: `{ "error": "Home not found or does not belong to you" }`
  - `404 Not Found`: `{ "error": "Room not found or does not belong to you" }`
  - `404 Not Found`: `{ "error": "Room does not belong to the specified home" }`
  - `500 Internal Server Error`: `{ "error": "Server error", "details": "..." }`

#### 3. Get Appliance by ID
- **Method**: GET
- **Endpoint**: `/:id`
- **Description**: Retrieves a specific appliance by ID.
- **Parameters**:
  - `id`: Appliance ID (e.g., `68eff6dfc5abd0c4fb1ee145`)
- **Response (200 OK)**:
  ```json
  {
    "_id": "68eff6dfc5abd0c4fb1ee145",
    "homeId": "68eff5fec5abd0c4fb1ee13d",
    "userId": "68e4e888715b38034c0f8f1e",
    "roomId": "68eff642c5abd0c4fb1ee141",
    "name": "Fridge",
    "type": "refrigerator",
    "energy_threshold": 40,
    "last_monitored_at": null,
    "createdAt": "2025-10-22T10:00:00Z",
    "updatedAt": "2025-10-22T10:00:00Z"
  }
  ```
- **Error Responses**:
  - `404 Not Found`: `{ "error": "Appliance not found" }`
  - `500 Internal Server Error`: `{ "error": "Server error", "details": "..." }`

#### 4. Update Appliance
- **Method**: PUT
- **Endpoint**: `/:id`
- **Description**: Updates an appliance's details (homeId, roomId, name, type, energy_threshold).
- **Parameters**:
  - `id`: Appliance ID (e.g., `68eff6dfc5abd0c4fb1ee145`)
- **Request Body**:
  ```json
  {
    "homeId": "68eff5fec5abd0c4fb1ee13d",
    "roomId": "68eff642c5abd0c4fb1ee141",
    "name": "Updated Fridge",
    "type": "refrigerator",
    "energy_threshold": 50
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "_id": "68eff6dfc5abd0c4fb1ee145",
    "homeId": "68eff5fec5abd0c4fb1ee13d",
    "userId": "68e4e888715b38034c0f8f1e",
    "roomId": "68eff642c5abd0c4fb1ee141",
    "name": "Updated Fridge",
    "type": "refrigerator",
    "energy_threshold": 50,
    "last_monitored_at": null,
    "createdAt": "2025-10-22T10:00:00Z",
    "updatedAt": "2025-10-22T10:00:00Z"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: `{ "error": "No fields to update" }`
  - `400 Bad Request`: `{ "error": "Appliance name already exists in this home" }`
  - `404 Not Found`: `{ "error": "Appliance not found" }`
  - `404 Not Found`: `{ "error": "Home not found or does not belong to you" }`
  - `404 Not Found`: `{ "error": "Room not found or does not belong to you" }`
  - `404 Not Found`: `{ "error": "Room does not belong to the specified home" }`
  - `500 Internal Server Error`: `{ "error": "Server error", "details": "..." }`

#### 5. Delete Appliance
- **Method**: DELETE
- **Endpoint**: `/:id`
- **Description**: Deletes an appliance.
- **Parameters**:
  - `id`: Appliance ID (e.g., `68eff6dfc5abd0c4fb1ee145`)
- **Response (204 No Content)**: Empty response
- **Error Responses**:
  - `404 Not Found`: `{ "error": "Appliance not found" }`
  - `500 Internal Server Error`: `{ "error": "Server error", "details": "..." }`

### Energy Routes (`/api/energy`)

#### 1. Create Energy Reading
- **Method**: POST
- **Endpoint**: `/`
- **Description**: Records a single energy reading for an appliance.
- **Rate Limit**: 100 posts per hour.
- **Request Body**:
  ```json
  {
    "homeId": "68eff5fec5abd0c4fb1ee13d",
    "applianceId": "68eff6dfc5abd0c4fb1ee145",
    "roomId": "68eff642c5abd0c4fb1ee141",
    "energy": 60,
    "power": 2000,
    "current": 10,
    "voltage": 220,
    "recorded_at": "2025-10-22T10:00:00Z",
    "is_randomized": false
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "_id": "68f0a123c5abd0c4fb1ee200",
    "homeId": "68eff5fec5abd0c4fb1ee13d",
    "userId": "68e4e888715b38034c0f8f1e",
    "applianceId": "68eff6dfc5abd0c4fb1ee145",
    "roomId": "68eff642c5abd0c4fb1ee141",
    "energy": 60,
    "power": 2000,
    "current": 10,
    "voltage": 220,
    "cost": 600,
    "recorded_at": "2025-10-22T10:00:00Z",
    "is_on": true,
    "is_randomized": false
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: `{ "error": "Invalid input", "details": "..." }`
  - `404 Not Found`: `{ "error": "Home not found or does not belong to you" }`
  - `404 Not Found`: `{ "error": "Appliance not found or does not belong to you" }`
  - `404 Not Found`: `{ "error": "Room not found or does not belong to you" }`
  - `404 Not Found`: `{ "error": "Room does not belong to the specified home" }`
  - `429 Too Many Requests`: `{ "error": "Too many energy posts, please try again after 1 hour" }`
  - `500 Internal Server Error`: `{ "error": "Server error", "details": "..." }`

#### 2. Create Energy Readings Batch
- **Method**: POST
- **Endpoint**: `/batch`
- **Description**: Records multiple energy readings in a batch.
- **Rate Limit**: 100 posts per hour.
- **Request Body**:
  ```json
  [
    {
      "homeId": "68eff5fec5abd0c4fb1ee13d",
      "applianceId": "68eff6dfc5abd0c4fb1ee145",
      "roomId": "68eff642c5abd0c4fb1ee141",
      "energy": 60,
      "power": 2000,
      "current": 10,
      "voltage": 220,
      "recorded_at": "2025-10-22T10:00:00Z",
      "is_randomized": false
    },
    {
      "homeId": "68eff5fec5abd0c4fb1ee13d",
      "applianceId": "68eff6dfc5abd0c4fb1ee146",
      "roomId": "68eff642c5abd0c4fb1ee141",
      "energy": 0.5,
      "power": 300,
      "current": 1.36,
      "voltage": 220,
      "recorded_at": "2025-10-22T10:00:00Z",
      "is_randomized": true
    }
  ]
  ```
- **Response (201 Created)**:
  ```json
  [
    {
      "_id": "68f0a123c5abd0c4fb1ee200",
      "homeId": "68eff5fec5abd0c4fb1ee13d",
      "userId": "68e4e888715b38034c0f8f1e",
      "applianceId": "68eff6dfc5abd0c4fb1ee145",
      "roomId": "68eff642c5abd0c4fb1ee141",
      "energy": 60,
      "power": 2000,
      "current": 10,
      "voltage": 220,
      "cost": 600,
      "recorded_at": "2025-10-22T10:00:00Z",
      "is_on": true,
      "is_randomized": false
    },
    {
      "_id": "68f0a123c5abd0c4fb1ee201",
      "homeId": "68eff5fec5abd0c4fb1ee13d",
      "userId": "68e4e888715b38034c0f8f1e",
      "applianceId": "68eff6dfc5abd0c4fb1ee146",
      "roomId": "68eff642c5abd0c4fb1ee141",
      "energy": 0.5,
      "power": 300,
      "current": 1.36,
      "voltage": 220,
      "cost": 5,
      "recorded_at": "2025-10-22T10:00:00Z",
      "is_on": true,
      "is_randomized": true
    }
  ]
  ```
- **Error Responses**:
  - `400 Bad Request`: `{ "error": "Invalid input", "details": "..." }`
  - `404 Not Found`: `{ "error": "Home not found or does not belong to you" }`
  - `404 Not Found`: `{ "error": "Appliance not found or does not belong to you" }`
  - `404 Not Found`: `{ "error": "Room not found or does not belong to you" }`
  - `404 Not Found`: `{ "error": "Room does not belong to the specified home" }`
  - `429 Too Many Requests`: `{ "error": "Too many energy posts, please try again after 1 hour" }`
  - `500 Internal Server Error`: `{ "error": "Server error", "details": "..." }`

#### 3. Get Energy Readings
- **Method**: GET
- **Endpoint**: `/`
- **Description**: Retrieves energy readings with optional filters.
- **Query Parameters**:
  - `homeId`: Home ID (optional, e.g., `68eff5fec5abd0c4fb1ee13d`)
  - `applianceId`: Appliance ID (optional, e.g., `68eff6dfc5abd0c4fb1ee145`)
  - `roomId`: Room ID (optional, e.g., `68eff642c5abd0c4fb1ee141`)
  - `is_randomized`: Boolean (optional, e.g., `true` or `false`)
  - `is_on`: Boolean (optional, e.g., `true` or `false`)
  - `start_date`: ISO date string (optional, e.g., `2025-10-01T00:00:00Z`)
  - `end_date`: ISO date string (optional, e.g., `2025-10-31T23:59:59Z`)
- **Response (200 OK)**:
  ```json
  [
    {
      "_id": "68f0a123c5abd0c4fb1ee200",
      "homeId": {
        "_id": "68eff5fec5abd0c4fb1ee13d",
        "name": "My Home"
      },
      "userId": "68e4e888715b38034c0f8f1e",
      "applianceId": {
        "_id": "68eff6dfc5abd0c4fb1ee145",
        "name": "Fridge"
      },
      "roomId": {
        "_id": "68eff642c5abd0c4fb1ee141",
        "name": "Kitchen"
      },
      "energy": 60,
      "power": 2000,
      "current": 10,
      "voltage": 220,
      "cost": 600,
      "recorded_at": "2025-10-22T10:00:00Z",
      "is_on": true,
      "is_randomized": false
    }
  ]
  ```
- **Error Responses**:
  - `500 Internal Server Error`: `{ "error": "Server error", "details": "..." }`

#### 4. Get Energy Summaries
- **Method**: GET
- **Endpoint**: `/summary`
- **Description**: Retrieves energy summaries with optional filters.
- **Query Parameters**:
  - `homeId`: Home ID (optional, e.g., `68eff5fec5abd0c4fb1ee13d`)
  - `applianceId`: Appliance ID (optional, e.g., `68eff6dfc5abd0c4fb1ee145`)
  - `roomId`: Room ID (optional, e.g., `68eff642c5abd0c4fb1ee141`)
  - `period_type`: Period type (optional, e.g., `daily`, `weekly`, `monthly`)
- **Response (200 OK)**:
  ```json
  [
    {
      "_id": "68f0a126c5abd0c4fb1ee203",
      "homeId": {
        "_id": "68eff5fec5abd0c4fb1ee13d",
        "name": "My Home"
      },
      "userId": "68e4e888715b38034c0f8f1e",
      "applianceId": {
        "_id": "68eff6dfc5abd0c4fb1ee145",
        "name": "Fridge"
      },
      "roomId": {
        "_id": "68eff642c5abd0c4fb1ee141",
        "name": "Kitchen"
      },
      "period_start": "2025-10-01T00:00:00Z",
      "period_end": "2025-10-31T23:59:59Z",
      "period_type": "monthly",
      "total_energy": 90,
      "avg_power": 1166.6666666666667,
      "total_cost": 900,
      "reading_count": 3,
      "active_time_percentage": 100
    }
  ]
  ```
- **Error Responses**:
  - `500 Internal Server Error`: `{ "error": "Server error", "details": "..." }`

#### 5. Get Home Energy Summary
- **Method**: GET
- **Endpoint**: `/summary/:homeId`
- **Description**: Retrieves energy summaries for a specific home.
- **Parameters**:
  - `homeId`: Home ID (e.g., `68eff5fec5abd0c4fb1ee13d`)
- **Response (200 OK)**:
  ```json
  [
    {
      "_id": "68f0a126c5abd0c4fb1ee203",
      "homeId": {
        "_id": "68eff5fec5abd0c4fb1ee13d",
        "name": "My Home"
      },
      "userId": "68e4e888715b38034c0f8f1e",
      "applianceId": {
        "_id": "68eff6dfc5abd0c4fb1ee145",
        "name": "Fridge"
      },
      "roomId": {
        "_id": "68eff642c5abd0c4fb1ee141",
        "name": "Kitchen"
      },
      "period_start": "2025-10-01T00:00:00Z",
      "period_end": "2025-10-31T23:59:59Z",
      "period_type": "monthly",
      "total_energy": 90,
      "avg_power": 1166.6666666666667,
      "total_cost": 900,
      "reading_count": 3,
      "active_time_percentage": 100
    }
  ]
  ```
- **Error Responses**:
  - `404 Not Found`: `{ "error": "Home not found or does not belong to you" }`
  - `500 Internal Server Error`: `{ "error": "Server error", "details": "..." }`

### Anomaly Routes (`/api/anomalies`)

#### 1. Get Anomalies
- **Method**: GET
- **Endpoint**: `/`
- **Description**: Retrieves anomaly alerts with optional filters.
- **Query Parameters**:
  - `homeId`: Home ID (optional, e.g., `68eff5fec5abd0c4fb1ee13d`)
  - `applianceId`: Appliance ID (optional, e.g., `68eff6dfc5abd0c4fb1ee145`)
  - `severity`: Severity level (optional, e.g., `low`, `medium`, `high`)
  - `status`: Status (optional, e.g., `active`, `acknowledged`, `resolved`)
  - `alert_type`: Alert type (optional, e.g., `high_energy`, `high_cost`, `unusual_spike`)
  - `startDate`: ISO date string (optional, e.g., `2025-10-01T00:00:00Z`)
  - `endDate`: ISO date string (optional, e.g., `2025-10-31T23:59:59Z`)
- **Response (200 OK)**:
  ```json
  [
    {
      "_id": "68f0a127c5abd0c4fb1ee204",
      "userId": "68e4e888715b38034c0f8f1e",
      "homeId": {
        "_id": "68eff5fec5abd0c4fb1ee13d",
        "name": "My Home"
      },
      "roomId": {
        "_id": "68eff642c5abd0c4fb1ee141",
        "name": "Kitchen"
      },
      "applianceId": {
        "_id": "68eff6dfc5abd0c4fb1ee145",
        "name": "Fridge",
        "energy_threshold": 40
      },
      "energySummaryId": {
        "_id": "68f0a126c5abd0c4fb1ee203",
        "total_energy": 90,
        "period_type": "monthly"
      },
      "alert_type": "high_energy",
      "description": "Energy usage for Fridge exceeded 40 kWh: 90 kWh",
      "recommended_action": "Check for malfunction or reduce usage",
      "severity": "high",
      "detected_at": "2025-10-22T10:00:01Z",
      "status": "active"
    }
  ]
  ```
- **Error Responses**:
  - `500 Internal Server Error`: `{ "error": "Server error", "details": "..." }`

### Notification Routes (`/api/notifications`)

#### 1. Get Notifications
- **Method**: GET
- **Endpoint**: `/`
- **Description**: Retrieves in-app notifications with optional filters.
- **Query Parameters**:
  - `status`: Notification status (optional, e.g., `pending`, `sent`, `failed`, `acknowledged`)
  - `homeId`: Home ID (optional, e.g., `68eff5fec5abd0c4fb1ee13d`)
  - `limit`: Number of notifications (default: 10)
  - `offset`: Skip number of notifications (default: 0)
- **Response (200 OK)**:
  ```json
  {
    "notifications": [
      {
        "_id": "68f0a129c5abd0c4fb1ee206",
        "userId": "68e4e888715b38034c0f8f1e",
        "homeId": "68eff5fec5abd0c4fb1ee13d",
        "anomalyAlertId": {
          "_id": "68f0a127c5abd0c4fb1ee204",
          "description": "Energy usage for Fridge exceeded 40 kWh: 90 kWh",
          "severity": "high",
          "alert_type": "high_energy"
        },
        "channels": ["email", "in-app"],
        "message": "Anomaly detected: Energy usage for Fridge exceeded 40 kWh: 90 kWh. Recommended: Check for malfunction or reduce usage",
        "status": "pending",
        "sent_at": null,
        "created_at": "2025-10-22T10:00:02Z",
        "due_date": null
      }
    ],
    "total": 1,
    "limit": 10,
    "offset": 0
  }
  ```
- **Error Responses**:
  - `500 Internal Server Error`: `{ "error": "Server error", "details": "..." }`

#### 2. Mark Notification as Acknowledged
- **Method**: PATCH
- **Endpoint**: `/:id/acknowledge`
- **Description**: Marks a single notification as acknowledged.
- **Parameters**:
  - `id`: Notification ID (e.g., `68f0a129c5abd0c4fb1ee206`)
- **Response (200 OK)**:
  ```json
  {
    "_id": "68f0a129c5abd0c4fb1ee206",
    "userId": "68e4e888715b38034c0f8f1e",
    "homeId": "68eff5fec5abd0c4fb1ee13d",
    "anomalyAlertId": {
      "_id": "68f0a127c5abd0c4fb1ee204",
      "description": "Energy usage for Fridge exceeded 40 kWh: 90 kWh",
      "severity": "high",
      "alert_type": "high_energy"
    },
    "channels": ["email", "in-app"],
    "message": "Anomaly detected: Energy usage for Fridge exceeded 40 kWh: 90 kWh. Recommended: Check for malfunction or reduce usage",
    "status": "acknowledged",
    "sent_at": "2025-10-22T10:02:00Z",
    "created_at": "2025-10-22T10:00:02Z",
    "due_date": null
  }
  ```
- **Error Responses**:
  - `404 Not Found`: `{ "error": "Notification not found or not authorized" }`
  - `500 Internal Server Error`: `{ "error": "Server error", "details": "..." }`

#### 3. Bulk Acknowledge Notifications
- **Method**: PATCH
- **Endpoint**: `/acknowledge`
- **Description**: Marks multiple notifications as acknowledged.
- **Request Body**:
  ```json
  {
    "ids": ["68f0a129c5abd0c4fb1ee206", "68f0a12cc5abd0c4fb1ee209"]
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "modifiedCount": 2
  }
  ```
- **Error Responses**:
  - `404 Not Found`: `{ "error": "No matching notifications found or not authorized" }`
  - `500 Internal Server Error`: `{ "error": "Server error", "details": "..." }`

#### 4. Delete Notification
- **Method**: DELETE
- **Endpoint**: `/:id`
- **Description**: Deletes a single notification.
- **Parameters**:
  - `id`: Notification ID (e.g., `68f0a129c5abd0c4fb1ee206`)
- **Response (200 OK)**:
  ```json
  {
    "message": "Notification deleted successfully"
  }
  ```
- **Error Responses**:
  - `404 Not Found`: `{ "error": "Notification not found or not authorized" }`
  - `500 Internal Server Error`: `{ "error": "Server error", "details": "..." }`

#### 5. Bulk Delete Notifications
- **Method**: DELETE
- **Endpoint**: `/`
- **Description**: Deletes multiple notifications.
- **Request Body**:
  ```json
  {
    "ids": ["68f0a129c5abd0c4fb1ee206", "68f0a12cc5abd0c4fb1ee209"]
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "deletedCount": 2
  }
  ```
- **Error Responses**:
  - `404 Not Found`: `{ "error": "No matching notifications found or not authorized" }`
  - `500 Internal Server Error`: `{ "error": "Server error", "details": "..." }`

## Model Fields

### User
- `_id`: ObjectId (e.g., `68e4e888715b38034c0f8f1e`)
- `email`: String (unique, e.g., `user@example.com`)
- `password`: String (hashed via bcrypt)
- `refreshToken`: String or null (JWT refresh token, 7-day expiry)

### Profile
- `_id`: ObjectId
- `userId`: ObjectId (references `User._id`)
- `name`: String (max 50 chars, e.g., `Ace Philip`)
- `notification_preferences`: Object (e.g., `{ email: true, push: false, in_app: true }`)
- `profilePicture`: String or null (e.g., `user123.jpg`)
- `created_at`: Date
- `updated_at`: Date

### Home
- `_id`: ObjectId (e.g., `68eff5fec5abd0c4fb1ee13d`)
- `userId`: ObjectId (references `User._id`)
- `name`: String (max 50 chars, e.g., `My Home`)
- `createdAt`: Date
- `updatedAt`: Date

### Room
- `_id`: ObjectId (e.g., `68eff642c5abd0c4fb1ee141`)
- `homeId`: ObjectId (references `Home._id`)
- `userId`: ObjectId (references `User._id`)
- `name`: String (max 50 chars, unique per `homeId`, e.g., `Kitchen`)
- `energy_threshold`: Number or null (e.g., 50 kWh)
- `createdAt`: Date
- `updatedAt`: Date

### Appliance
- `_id`: ObjectId (e.g., `68eff6dfc5abd0c4fb1ee145`)
- `homeId`: ObjectId (references `Home._id`)
- `userId`: ObjectId (references `User._id`)
- `roomId`: ObjectId or null (references `Room._id`)
- `name`: String (max 50 chars, unique per `homeId`, e.g., `Fridge`)
- `type`: String or null (max 50 chars, e.g., `refrigerator`)
- `energy_threshold`: Number or null (e.g., 40 kWh)
- `last_monitored_at`: Date or null
- `createdAt`: Date
- `updatedAt`: Date

### Energy Reading
- `_id`: ObjectId (e.g., `68f0a123c5abd0c4fb1ee200`)
- `homeId`: ObjectId (references `Home._id`)
- `userId`: ObjectId (references `User._id`)
- `applianceId`: ObjectId (references `Appliance._id`)
- `roomId`: ObjectId or null (references `Room._id`)
- `energy`: Number (kWh, non-negative, e.g., 60)
- `power`: Number (watts, non-negative, e.g., 2000)
- `current`: Number (amps, non-negative, e.g., 10)
- `voltage`: Number (volts, non-negative, e.g., 220)
- `cost`: Number (PHP, calculated as `energy * BILLING_RATE`, e.g., 600)
- `recorded_at`: Date (e.g., `2025-10-22T10:00:00Z`)
- `is_on`: Boolean (true if `power > 0`)
- `is_randomized`: Boolean (true for simulated data, false for real data)

### Energy Summary
- `_id`: ObjectId (e.g., `68f0a126c5abd0c4fb1ee203`)
- `homeId`: ObjectId (references `Home._id`)
- `userId`: ObjectId (references `User._id`)
- `applianceId`: ObjectId or null (references `Appliance._id`)
- `roomId`: ObjectId or null (references `Room._id`)
- `period_start`: Date (e.g., `2025-10-01T00:00:00Z`)
- `period_end`: Date (e.g., `2025-10-31T23:59:59Z`)
- `period_type`: String (e.g., `daily`, `weekly`, `monthly`)
- `total_energy`: Number (kWh, non-negative, e.g., 90)
- `avg_power`: Number (watts, non-negative, e.g., 1166.67)
- `total_cost`: Number (PHP, non-negative, e.g., 900)
- `reading_count`: Number (non-negative, e.g., 3)
- `active_time_percentage`: Number (0-100, e.g., 100)

### Anomaly Alert
- `_id`: ObjectId (e.g., `68f0a127c5abd0c4fb1ee204`)
- `userId`: ObjectId (references `User._id`)
- `homeId`: ObjectId (references `Home._id`)
- `roomId`: ObjectId or null (references `Room._id`)
- `applianceId`: ObjectId or null (references `Appliance._id`)
- `energySummaryId`: ObjectId or null (references `EnergySummary._id`)
- `alert_type`: String (e.g., `high_energy`, `high_cost`, `unusual_spike`)
- `description`: String (e.g., `Energy usage for Fridge exceeded 40 kWh: 90 kWh`)
- `recommended_action`: String (e.g., `Check for malfunction or reduce usage`)
- `severity`: String (e.g., `low`, `medium`, `high`)
- `detected_at`: Date (e.g., `2025-10-22T10:00:01Z`)
- `status`: String (e.g., `active`, `acknowledged`, `resolved`)

### Notification
- `_id`: ObjectId (e.g., `68f0a129c5abd0c4fb1ee206`)
- `userId`: ObjectId (references `User._id`)
- `homeId`: ObjectId or null (references `Home._id`)
- `anomalyAlertId`: ObjectId or null (references `AnomalyAlert._id`)
- `channels`: Array of String (e.g., `["email", "in-app"]`, from `NOTIFICATION_TYPES`)
- `message`: String (e.g., `Anomaly detected: Energy usage for Fridge exceeded 40 kWh: 90 kWh`)
- `status`: String (e.g., `pending`, `sent`, `failed`, `acknowledged`)
- `sent_at`: Date or null
- `created_at`: Date
- `due_date`: Date or null (e.g., `2025-11-05T23:59:59Z`)

### OTP
- `_id`: ObjectId (e.g., `68f0a12bc5abd0c4fb1ee208`)
- `userId`: ObjectId (references `User._id`)
- `notificationId`: ObjectId (references `Notification._id`)
- `otp`: String (6-digit, e.g., `123456`)
- `expires_at`: Date (e.g., `2025-10-22T10:10:02Z`)

## Constants (`backend/utils/constants.js`)

```javascript
module.exports = {
  MAX_NAME_LENGTH: 50,
  UNIQUE_SCOPES: {
    room: ["name", "homeId"],
    appliance: ["name", "homeId"]
  },
  ALERT_TYPES: ["high_energy", "high_cost", "unusual_spike"],
  SEVERITY_LEVELS: ["low", "medium", "high"],
  NOTIFICATION_TYPES: ["email", "push", "in-app", "bill_reminder"],
  PERIOD_TYPES: ["daily", "weekly", "monthly"],
  HIGH_ENERGY_THRESHOLD: 50, // kWh
  HIGH_COST_THRESHOLD: 100, // PHP
  OTP_EXPIRY_MINUTES: 10,
  ENERGY_POST_RATE_LIMIT: 100, // Posts per hour
  BILLING_DUE_DAYS: 5, // Days after month-end for bill due date
  VALID_ENERGY_RANGES: {
    energy: { min: 0, max: 100 }, // kWh
    power: { min: 0, max: 5000 }, // Watts
    current: { min: 0, max: 50 }, // Amps
    voltage: { min: 0, max: 300 } // Volts
  }
};
```

## Security Features
- **Authentication**: JWT (15-min expiry) and refresh tokens (7-day expiry) stored in MongoDB.
- **Password Hashing**: bcrypt.
- **Input Validation**: Ensures valid ObjectIds, ranges, and ownership via middleware (`validate.js`).
- **Email Notifications**: OTP sent via nodemailer for `email` and `bill_reminder` channels, returns `503` on SMTP failure.
- **Rate Limiting**:
  - `/api/users/login`: 5 attempts/15 min.
  - `/api/users/password/reset/*`: 3 attempts/hour.
  - `/api/energy`: 100 posts/hour.
  - Returns `429` on limit exceed.

## Notes
- **Authentication**: Required for all endpoints except `/api/users/register`, `/api/users/login`, `/api/users/password/reset/*`.
- **MongoDB Indexes**: Optimized for performance (e.g., `energySummary` on `userId`, `homeId`, `period_type`).
- **Logs**: Stored in `backend/logs/` for debugging.
- **ESP32 Integration**: Posts real data for one appliance (e.g., Fridge, `is_randomized: false`) and randomized data for others (e.g., AC, TV, `is_randomized: true`).
- **Billing Reminders**: Triggered by cron job at month-end, sent if `total_cost > 0` and user has `email` or `bill_reminder` in `notification_preferences`.

## Dependencies
- **Backend**: express, mongoose, bcryptjs, jsonwebtoken, express-rate-limit, nodemailer, multer, node-cron, cors, helmet, morgan.
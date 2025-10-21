# Home Energy Monitoring System Documentation

## Setup

This section guides you through setting up the Home Energy Monitoring System on your local machine, covering backend installation, MongoDB configuration, and ESP32/Arduino setup for real and randomized energy data.

### Prerequisites
- **Node.js**: Version 18.x or higher ([nodejs.org](https://nodejs.org)).
- **MongoDB**: Version 4.4 or higher ([mongodb.com](https://www.mongodb.com/try/download/community)).
- **Gmail Account**: For OTP emails (e.g., `user@example.com`). If 2FA is enabled, generate an App Password at [myaccount.google.com/security](https://myaccount.google.com/security).
- **ESP32 with PZEM-004T**: For real-time energy monitoring of one appliance and simulating others via randomization.

### 1. Clone the Project
Clone the repository:
```bash
git clone https://github.com/breeyanzxcx/MERN-project.git
```

### 2. Install Dependencies
Install backend dependencies:
```bash
cd backend
npm install
```

### 3. Set Up MongoDB
1. **Install MongoDB**:
   - Follow instructions at [mongodb.com/docs/manual/installation/](https://www.mongodb.com/docs/manual/installation/) for your OS (Windows, macOS, Linux).
   - Start MongoDB:
     ```bash
     mongod --dbpath data/db
     ```
2. **Create Database Directory**:
   - Create `data/db` in the project root:
     ```bash
     mkdir -p data/db
     ```
   - Update `--dbpath` if using a different directory.
3. **Verify Connection**:
   - Default connection string: `mongodb://localhost:27017/home-energy`.
   - Test using MongoDB Compass or shell:
     ```bash
     mongo mongodb://localhost:27017/home-energy
     ```

### 4. Configure Environment Variables
Create `backend/env.js`:
```javascript
module.exports = {
  MONGODB_URI: 'mongodb://localhost:27017/home-energy',
  JWT_SECRET: '390577a62a6463aebf0c4386c357d4e1105cde062243d06fcc675e9e1a8f4353', // Secure random string
  JWT_REFRESH_SECRET: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0', // Secure random string
  EMAIL_USER: 'user@example.com', // Gmail for OTPs
  EMAIL_PASS: 'your_gmail_app_password', // App Password if 2FA enabled
  BILLING_RATE: 10, // PHP/kWh
  RANDOM_SEED: '12345' // Optional seed for randomized data testing
};
```
- **JWT_SECRET**, **JWT_REFRESH_SECRET**: Generate using `crypto.randomBytes(32).toString('hex')`.
- **EMAIL_PASS**: Use Gmail App Password if 2FA enabled ([myaccount.google.com/security](https://myaccount.google.com/security)).
- **BILLING_RATE**: Default 10 PHP/kWh, adjust as needed.
- **RANDOM_SEED**: Optional for consistent randomized data in testing.

### 5. Set Up ESP32 with PZEM-004T
1. **Hardware**:
   - Connect PZEM-004T to ESP32 for one appliance (e.g., Smart Bulb).
2. **Arduino Code**:
   - Configure to post real data for the monitored appliance and randomized data for others.
   - Example (simplified):
     ```cpp
     #include <WiFi.h>
     #include <HTTPClient.h>
     void loop() {
       // Real data (Smart Bulb)
       if (millis() % 60000 == 0) {
         float power = pzem.readPower();
         float energy = pzem.readEnergy();
         httpPost("http://localhost:5000/api/energy", {
           "applianceId": "507f1f77bcf86cd799439014",
           "energy": energy,
           "power": power,
           "is_randomized": false
         });
       }
       // Randomized data (Fridge, AC)
       if (millis() % 300000 == 0) {
         String appliances[] = {"fridge_id", "ac_id"};
         String selected = appliances[random(0, 2)];
         bool isOn = random(0, 100) < 70; // 70% on
         float power = isOn ? random(100, 500) : 0;
         httpPost("http://localhost:5000/api/energy", {
           "applianceId": selected,
           "energy": isOn ? random(0.1, 2.0) : 0,
           "power": power,
           "is_randomized": true
         });
       }
     }
     ```
   - Fetch appliances dynamically via `GET /api/appliances` (optional).
3. **Future Sensors**:
   - Add new PZEM, update Arduino to post real data (`is_randomized: false`).

### 6. Run the Backend
Start the server:
```bash
cd backend
node server.js
```
Or, for development:
```bash
npm install -g nodemon
nodemon server.js
```
- Runs on `http://localhost:5000`.
- Logs in `backend/logs/`.

### 7. Test the Setup
- **MongoDB**:
  - Connect to `mongodb://localhost:27017/home-energy`.
  - Check collections: `users`, `appliances`, `energyreadings`, etc.
- **API**:
  - Register user:
    ```bash
    curl -X POST http://localhost:5000/api/users/register \
      -H "Content-Type: application/json" \
      -d '{"email": "user@example.com", "password": "securepassword123", "name": "Ace Philip"}'
    ```
  - Response: `{ token, refreshToken, user }`.
- **ESP32**:
  - Post real data:
    ```bash
    curl -X POST http://localhost:5000/api/energy \
      -H "Content-Type: application/json" \
      -d '{"homeId": "507f1f77bcf86cd799439012", "applianceId": "507f1f77bcf86cd799439014", "energy": 0.1, "power": 60, "is_randomized": false}'
    ```
  - Post randomized data:
    ```bash
    curl -X POST http://localhost:5000/api/energy \
      -H "Content-Type: application/json" \
      -d '{"homeId": "507f1f77bcf86cd799439012", "applianceId": "fridge_id", "energy": 0.5, "power": 300, "is_randomized": true}'
    ```
- **Email**:
  - Request password reset:
    ```bash
    curl -X POST http://localhost:5000/api/users/password/reset/request \
      -H "Content-Type: application/json" \
      -d '{"email": "user@example.com"}'
    ```
  - Check Gmail (sent/spam).

### 8. Troubleshooting
- **MongoDB Connection**:
  - Ensure `mongod` runs and `data/db` exists.
  - Verify `MONGODB_URI`.
- **Email Failure**:
  - Check `EMAIL_USER`, `EMAIL_PASS`.
  - Ensure App Password for 2FA.
  - Check `backend/logs/` for 503 errors.
- **ESP32**:
  - Verify WiFi and `POST /api/energy` connectivity.
  - Check logs for 400/401 errors.
- **Rate Limiting**:
  - Login: 5 attempts/15 min.
  - OTP: 3 attempts/hour.
  - Energy posts: 100/hour (new).
  - 429 errors on limit exceed.

## Model Fields

### user
- `_id`: ObjectId (unique identifier).
- `email`: String (unique, e.g., `user@example.com`).
- `password`: String (hashed via `bcrypt`).
- `refreshToken`: String or null (JWT refresh token, 7-day expiry, default: null).

### profile
- `_id`: ObjectId.
- `userId`: ObjectId (references `user._id`).
- `name`: String (e.g., "Ace Philip", max 50 chars).
- `notification_preferences`: Object (e.g., `{ email: true, push: false, in_app: true }`).
- `profilePicture`: String or null (e.g., `user123.jpg`, default: null).
- `created_at`: Date (defaults to now).
- `updated_at`: Date (defaults to now).

### otp
- `_id`: ObjectId.
- `userId`: ObjectId (references `user._id`).
- `notificationId`: ObjectId (references `notification._id`).
- `otp`: String (6-digit, e.g., "123456").
- `expires_at`: Date (10 minutes from creation).

### notification
- `_id`: ObjectId.
- `userId`: ObjectId (references `user._id`).
- `homeId`: ObjectId or null (references `home._id`).
- `anomalyAlertId`: ObjectId or null (references `anomalyAlert._id`, null for bill reminders).
- `channels`: Array of String (e.g., ["email", "in-app"], from `constants.js NOTIFICATION_TYPES`).
- `message`: String (e.g., "High energy usage in smart bulb: 15 kWh").
- `status`: String ("pending", "sent", "failed", "acknowledged", default: "pending").
- `sent_at`: Date or null (null if pending/failed).
- `created_at`: Date (defaults to now).
- `due_date`: Date or null (e.g., "2025-11-05" for bills, null otherwise).

### home
- `_id`: ObjectId.
- `userId`: ObjectId (references `user._id`).
- `name`: String (e.g., "Main House", max 50 chars).

### room
- `_id`: ObjectId.
- `homeId`: ObjectId (references `home._id`).
- `userId`: ObjectId (references `user._id`).
- `name`: String (e.g., "kitchen", max 50 chars, unique per `homeId`).
- `energy_threshold`: Number or null (e.g., 50 kWh, default from `constants.js`).

### appliance
- `_id`: ObjectId.
- `homeId`: ObjectId (references `home._id`).
- `userId`: ObjectId (references `user._id`).
- `roomId`: ObjectId or null (references `room._id`).
- `name`: String (e.g., "smart bulb", max 50 chars, unique per `homeId`).
- `type`: String or null (e.g., "lighting", max 50 chars, optional).
- `energy_threshold`: Number or null (e.g., 10 kWh, default from `constants.js`).
- `last_monitored_at`: Date or null (timestamp of last real data post, null for randomized).

### energyReading
- `_id`: ObjectId.
- `homeId`: ObjectId (references `home._id`).
- `userId`: ObjectId (references `user._id`).
- `applianceId`: ObjectId (references `appliance._id`).
- `roomId`: ObjectId or null (references `room._id`, from `appliance.roomId`).
- `energy`: Number (kWh, e.g., 1.5, non-negative, from PZEM or randomized).
- `power`: Number (watts, e.g., 500, non-negative).
- `current`: Number (amps, e.g., 2.3, non-negative).
- `voltage`: Number (volts, e.g., 220, non-negative).
- `cost`: Number (PHP, `energy * BILLING_RATE`, non-negative).
- `recorded_at`: Date (UTC, defaults to now).
- `is_on`: Boolean (true if `power > 0`, false otherwise).
- `is_randomized`: Boolean (true for simulated data, false for real PZEM data).

### energySummary
- `_id`: ObjectId.
- `homeId`: ObjectId (references `home._id`).
- `userId`: ObjectId (references `user._id`).
- `applianceId`: ObjectId or null (references `appliance._id`).
- `roomId`: ObjectId or null (references `room._id`).
- `period_start`: Date (UTC, e.g., "2025-10-01T00:00:00Z").
- `period_end`: Date (UTC, e.g., "2025-10-31T23:59:59Z").
- `period_type`: String ("daily", "weekly", "monthly", from `constants.js PERIOD_TYPES`).
- `total_energy`: Number (kWh sum, non-negative).
- `avg_power`: Number (watts average, non-negative).
- `total_cost`: Number (PHP sum, non-negative).
- `reading_count`: Number (count of readings, non-negative).
- `active_time_percentage`: Number (percentage of readings with `is_on: true`, 0-100).

### anomalyAlert
- `_id`: ObjectId.
- `userId`: ObjectId (references `user._id`).
- `homeId`: ObjectId (references `home._id`).
- `roomId`: ObjectId or null (references `room._id`).
- `applianceId`: ObjectId or null (references `appliance._id`).
- `energySummaryId`: ObjectId or null (references `energySummary._id`).
- `alert_type`: String (e.g., "high_energy", from `constants.js ALERT_TYPES`).
- `description`: String (e.g., "Smart bulb used 15 kWh > 10 kWh").
- `recommended_action`: String (e.g., "Check for malfunction").
- `severity`: String ("low", "medium", "high", from `constants.js SEVERITY_LEVELS`).
- `detected_at`: Date (UTC, defaults to now).
- `status`: String ("active", "acknowledged", "resolved", default: "active").

## System Flow

1. **User Authentication**:
   - **Register**: `POST /api/users/register` creates `user` and `profile` (email, hashed password, name). Returns JWT (15-min expiry), refresh token (7-day expiry).
   - **Login**: `POST /api/users/login` (5 attempts/15 min) validates credentials, returns JWT, refresh token.
   - **Refresh Token**: `POST /api/users/refresh-token` validates refresh token, issues new JWT.
   - **Logout**: `POST /api/users/logout` clears refresh token.
   - **Password Reset**:
     - `POST /api/users/password/reset/request` (3 attempts/hour) sends OTP via Gmail, creates `otp`, `notification`.
     - `POST /api/users/password/reset/verify` validates OTP, updates password.
     - Returns 503 on email failure.

2. **Setup**:
   - Create `home` (`POST /api/homes`), `room` (`POST /api/rooms`, unique name per `homeId`), `appliance` (`POST /api/appliances`, unique name per `homeId`, optional `energy_threshold`).
   - ESP32 fetches appliances via `GET /api/appliances` or hardcodes IDs.

3. **Record Energy Reading**:
   - ESP32 posts to `POST /api/energy` (100 posts/hour limit):
     - **Real Data**: For one appliance (e.g., Smart Bulb) using PZEM-004T (`is_randomized: false`, updates `last_monitored_at`).
     - **Randomized Data**: For other appliances (e.g., Fridge, AC) with simulated data (`is_randomized: true`).
   - Validates: `applianceId`, `homeId`, `userId`, ranges (e.g., `energy: 0-100 kWh`, `power: 0-5000 W`).
   - Sets `is_on: power > 0`, `cost: energy * BILLING_RATE`.
   - Saves to `energyReading`, triggers `energySummary` update.

4. **Precompute Summaries**:
   - `energyService.js` aggregates `energyReading` into `energySummary` (daily/weekly/monthly):
     - `total_energy`: Sum of `energy`.
     - `avg_power`: Average of `power`.
     - `total_cost`: Sum of `cost`.
     - `active_time_percentage`: `(count of is_on: true / reading_count) * 100`.
     - Uses UTC for `period_start/end`.

5. **Anomaly Detection (Prepared)**:
   - During `energySummary` update, check if `total_energy > energy_threshold` (from `appliance`, `room`, or `constants.js HIGH_ENERGY_THRESHOLD`) for `is_randomized: false`.
   - Create `anomalyAlert` (e.g., "high_energy", "Smart bulb used 15 kWh > 10 kWh").

6. **Notifications (Prepared)**:
   - For `anomalyAlert`, create `notification` with user’s `notification_preferences` (e.g., ["email", "in-app"]).
   - For monthly `energySummary`, create bill reminder (`channels: ["bill_reminder", "email"]`, `due_date: end of month + 5 days`).
   - Email: Generate `otp`, send to `user.email`, await `POST /api/notifications/verify-otp`.
   - In-app: Display via `GET /api/notifications`.

7. **User Actions**:
   - View energy history: `GET /api/energy` (filter by `homeId`, `applianceId`, `is_randomized`, `is_on`).
   - View summaries: `GET /api/energy/summary` (filter by `period_type`, `applianceId`).
   - Verify OTP: `POST /api/notifications/verify-otp`.
   - Acknowledge notifications: `POST /api/notifications/:id/acknowledge`.
   - Update profile: `PUT /api/users/profile`.

## API Response Examples

### 1. Register User
**POST /api/users/register**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "Ace Philip"
}
```
**Response**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": "507f1f77bcf86cd799439011", "email": "user@example.com", "name": "Ace Philip" }
}
```

### 2. Login
**POST /api/users/login** (5 attempts/15 min)
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```
**Response**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": "507f1f77bcf86cd799439011", "email": "user@example.com", "name": "Ace Philip" }
}
```
**Error**
```json
{ "error": "Too many login attempts, please try again after 15 minutes" }
```

### 3. Refresh Token
**POST /api/users/refresh-token**
```json
{ "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
```
**Response**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 4. Request Password Reset
**POST /api/users/password/reset/request** (3 attempts/hour)
```json
{ "email": "user@example.com" }
```
**Response**
```json
{ "message": "OTP sent to your email" }
```
**Error**
```json
{ "error": "Too many OTP requests, please try again after 1 hour" }
```

### 5. Verify Password Reset
**POST /api/users/password/reset/verify** (3 attempts/hour)
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "newsecurepassword123"
}
```
**Response**
```json
{ "message": "Password reset successful" }
```

### 6. Create Home
**POST /api/homes**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "name": "Main House"
}
```
**Response**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "userId": "507f1f77bcf86cd799439011",
  "name": "Main House"
}
```

### 7. Create Room
**POST /api/rooms**
```json
{
  "homeId": "507f1f77bcf86cd799439012",
  "userId": "507f1f77bcf86cd799439011",
  "name": "home office",
  "energy_threshold": 50
}
```
**Response**
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "homeId": "507f1f77bcf86cd799439012",
  "userId": "507f1f77bcf86cd799439011",
  "name": "home office",
  "energy_threshold": 50
}
```

### 8. Create Appliance
**POST /api/appliances**
```json
{
  "homeId": "507f1f77bcf86cd799439012",
  "userId": "507f1f77bcf86cd799439011",
  "roomId": "507f1f77bcf86cd799439013",
  "name": "smart bulb",
  "type": "custom lighting",
  "energy_threshold": 10
}
```
**Response**
```json
{
  "_id": "507f1f77bcf86cd799439014",
  "homeId": "507f1f77bcf86cd799439012",
  "userId": "507f1f77bcf86cd799439011",
  "roomId": "507f1f77bcf86cd799439013",
  "name": "smart bulb",
  "type": "custom lighting",
  "energy_threshold": 10,
  "last_monitored_at": null
}
```

### 9. Get Appliances (for ESP32)
**GET /api/appliances?homeId=507f1f77bcf86cd799439012**
**Response**
```json
[
  {
    "_id": "507f1f77bcf86cd799439014",
    "name": "smart bulb",
    "roomId": "507f1f77bcf86cd799439013",
    "last_monitored_at": "2025-10-22T08:00:00Z"
  },
  {
    "_id": "fridge_id",
    "name": "fridge",
    "roomId": "kitchen_id",
    "last_monitored_at": null
  }
]
```

### 10. Create Energy Reading
**POST /api/energy**
```json
{
  "homeId": "507f1f77bcf86cd799439012",
  "userId": "507f1f77bcf86cd799439011",
  "applianceId": "507f1f77bcf86cd799439014",
  "roomId": "507f1f77bcf86cd799439013",
  "energy": 0.1,
  "power": 60,
  "current": 0.27,
  "voltage": 220,
  "recorded_at": "2025-10-22T08:00:00Z",
  "is_randomized": false
}
```
**Response**
```json
{
  "_id": "507f1f77bcf86cd799439015",
  "homeId": "507f1f77bcf86cd799439012",
  "userId": "507f1f77bcf86cd799439011",
  "applianceId": "507f1f77bcf86cd799439014",
  "roomId": "507f1f77bcf86cd799439013",
  "energy": 0.1,
  "power": 60,
  "current": 0.27,
  "voltage": 220,
  "cost": 1,
  "recorded_at": "2025-10-22T08:00:00Z",
  "is_on": true,
  "is_randomized": false
}
```

### 11. Get Energy Readings
**GET /api/energy?applianceId=507f1f77bcf86cd799439014&is_randomized=false**
**Response**
```json
[
  {
    "_id": "507f1f77bcf86cd799439015",
    "applianceId": "507f1f77bcf86cd799439014",
    "energy": 0.1,
    "power": 60,
    "is_on": true,
    "is_randomized": false,
    "recorded_at": "2025-10-22T08:00:00Z"
  }
]
```

### 12. Precomputed Energy Summary
**Internal Update**
```json
{
  "_id": "507f1f77bcf86cd799439016",
  "homeId": "507f1f77bcf86cd799439012",
  "userId": "507f1f77bcf86cd799439011",
  "applianceId": "507f1f77bcf86cd799439014",
  "roomId": "507f1f77bcf86cd799439013",
  "period_start": "2025-10-01T00:00:00Z",
  "period_end": "2025-10-31T23:59:59Z",
  "period_type": "monthly",
  "total_energy": 15,
  "avg_power": 90,
  "total_cost": 150,
  "reading_count": 5,
  "active_time_percentage": 100
}
```

### 13. Anomaly Alert (High Energy)
**Internal Creation**
```json
{
  "_id": "507f1f77bcf86cd799439017",
  "userId": "507f1f77bcf86cd799439011",
  "homeId": "507f1f77bcf86cd799439012",
  "roomId": "507f1f77bcf86cd799439013",
  "applianceId": "507f1f77bcf86cd799439014",
  "energySummaryId": "507f1f77bcf86cd799439016",
  "alert_type": "high_energy",
  "description": "Smart bulb in home office used 15 kWh this month, exceeding threshold of 10 kWh",
  "recommended_action": "Check for malfunction or reduce usage",
  "severity": "medium",
  "detected_at": "2025-10-22T12:00:00Z",
  "status": "active"
}
```

### 14. Notification (Anomaly, Multi-Channel)
**Internal Creation**
```json
{
  "_id": "507f1f77bcf86cd799439018",
  "userId": "507f1f77bcf86cd799439011",
  "homeId": "507f1f77bcf86cd799439012",
  "anomalyAlertId": "507f1f77bcf86cd799439017",
  "channels": ["email", "in-app"],
  "message": "High energy usage in home office smart bulb: 15 kWh. Check for malfunction or reduce usage.",
  "status": "pending",
  "sent_at": null,
  "created_at": "2025-10-22T12:01:00Z",
  "due_date": null
}
```

### 15. OTP for Email Notification
**Internal Creation**
```json
{
  "_id": "507f1f77bcf86cd799439020",
  "userId": "507f1f77bcf86cd799439011",
  "notificationId": "507f1f77bcf86cd799439018",
  "otp": "123456",
  "expires_at": "2025-10-22T12:11:00Z"
}
```

### 16. Verify OTP
**POST /api/notifications/verify-otp**
```json
{
  "notificationId": "507f1f77bcf86cd799439018",
  "otp": "123456"
}
```
**Response**
```json
{
  "_id": "507f1f77bcf86cd799439018",
  "userId": "507f1f77bcf86cd799439011",
  "homeId": "507f1f77bcf86cd799439012",
  "anomalyAlertId": "507f1f77bcf86cd799439017",
  "channels": ["email", "in-app"],
  "message": "High energy usage in home office smart bulb: 15 kWh. Check for malfunction or reduce usage.",
  "status": "sent",
  "sent_at": "2025-10-22T12:02:00Z",
  "created_at": "2025-10-22T12:01:00Z",
  "due_date": null
}
```

### 17. Bill Reminder Notification
**Internal Creation** (cron job, end of October)
```json
{
  "_id": "507f1f77bcf86cd799439019",
  "userId": "507f1f77bcf86cd799439011",
  "homeId": "507f1f77bcf86cd799439012",
  "anomalyAlertId": null,
  "channels": ["bill_reminder", "email"],
  "message": "Your October bill for Main House of 257 PHP is due by 2025-11-05",
  "status": "pending",
  "sent_at": null,
  "created_at": "2025-10-31T23:59:59Z",
  "due_date": "2025-11-05T23:59:59Z"
}
```

### 18. Fetch Notifications
**GET /api/notifications?status=pending**
**Response**
```json
[
  {
    "id": "507f1f77bcf86cd799439018",
    "userId": "507f1f77bcf86cd799439011",
    "homeId": "507f1f77bcf86cd799439012",
    "anomalyAlertId": "507f1f77bcf86cd799439017",
    "channels": ["email", "in-app"],
    "message": "High energy usage in home office smart bulb: 15 kWh. Check for malfunction or reduce usage.",
    "status": "pending",
    "created_at": "2025-10-22T12:01:00Z",
    "alert": {
      "home": "Main House",
      "room": "home office",
      "appliance": "smart bulb",
      "description": "Smart bulb in home office used 15 kWh this month, exceeding threshold of 10 kWh",
      "recommended_action": "Check for malfunction or reduce usage",
      "severity": "medium"
    }
  },
  {
    "id": "507f1f77bcf86cd799439019",
    "userId": "507f1f77bcf86cd799439011",
    "homeId": "507f1f77bcf86cd799439012",
    "anomalyAlertId": null,
    "channels": ["bill_reminder", "email"],
    "message": "Your October bill for Main House of 257 PHP is due by 2025-11-05",
    "status": "pending",
    "created_at": "2025-10-31T23:59:59Z",
    "due_date": "2025-11-05T23:59:59Z"
  }
]
```

## Constants (constants.js)

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
  OTP_EXPIRY_MINUTES: 10,
  ENERGY_POST_RATE_LIMIT: 100, // Posts per hour
  VALID_ENERGY_RANGES: {
    energy: { min: 0, max: 100 }, // kWh
    power: { min: 0, max: 5000 }, // Watts
    current: { min: 0, max: 50 }, // Amps
    voltage: { min: 0, max: 300 } // Volts
  }
};
```

## Security Features
- **Authentication**: JWT (15-min expiry), refresh tokens (7-day expiry, stored in MongoDB).
- **Rate Limiting**:
  - `/api/users/login`: 5 attempts/15 min.
  - `/api/users/password/reset/*`: 3 attempts/hour.
  - `/api/energy`: 100 posts/hour.
  - 429 errors on limit exceed.
- **Password Hashing**: `bcrypt`.
- **Input Validation**: Ensures valid IDs, ranges, ownership.
- **Email Notifications**: OTP via Gmail, 503 on failure.

## Dependencies
- **Backend**: `express`, `mongoose`, `bcryptjs`, `jsonwebtoken`, `express-rate-limit`, `nodemailer`, `multer`.
- **Removed**: `redis`.

## Notes
- Authentication required (`Authorization: Bearer <token>`) except for `/register`, `/login`, `/password/reset/*`.
- MongoDB stores all data.
- Logs in `backend/logs/`.
- Gmail App Password required for `EMAIL_PASS` if 2FA enabled.
- ESP32 posts real data for one appliance, randomized for others.
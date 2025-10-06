Home Energy Monitoring System Documentation

## Model Fields

### home

- `_id`: ObjectId (unique identifier for the home).
- `userId`: ObjectId (references `user._id`, links home to user).
- `name`: String (e.g., "Main House", user-defined, non-empty, max 50 chars).

### user

- `_id`: ObjectId (unique identifier for the user).
- `email`: String (user’s email, unique, validated format, e.g., `user@gmail.com`).
- `password`: String (hashed password for authentication).

### profile

- `_id`: ObjectId (unique identifier for the profile).
- `userId`: ObjectId (references `user._id`, one-to-one relationship).
- `name`: String (user’s display name, e.g., "John Doe", non-empty, max 50 chars).
- `created_at`: Date (timestamp of profile creation, defaults to now).
- `notification_preferences`: Object (e.g., `{ email: true, push: false, in_app: true }`, user-defined preferences for notification channels).

### room

- `_id`: ObjectId (unique identifier for the room).
- `homeId`: ObjectId (references `home._id`, links room to home).
- `userId`: ObjectId (references `user._id`, links room to user).
- `name`: String (e.g., "kitchen", "office", user-defined, non-empty, max 50 chars, unique per `homeId`).
- `energy_threshold`: Number or null (custom energy threshold in kWh for anomaly detection, e.g., 50, null for default from `constants.js`).

### appliance

- `_id`: ObjectId (unique identifier for the appliance).
- `homeId`: ObjectId (references `home._id`, links appliance to home).
- `userId`: ObjectId (references `user._id`, links appliance to user).
- `roomId`: ObjectId or null (references `room._id`, optional, null if not tied to a room).
- `name`: String (e.g., "fridge", "smart bulb", user-defined, non-empty, max 50 chars, unique per `homeId`).
- `type`: String or null (e.g., "cooling", "custom", user-defined, non-empty, max 50 chars, optional).
- `energy_threshold`: Number or null (custom energy threshold in kWh for anomaly detection, e.g., 50, null for default from `constants.js`).

### energyReading

- `_id`: ObjectId (unique identifier for the reading).
- `homeId`: ObjectId (references `home._id`, links reading to home).
- `userId`: ObjectId (references `user._id`, links reading to user).
- `applianceId`: ObjectId (references `appliance._id`, links reading to appliance).
- `roomId`: ObjectId or null (references `room._id`, optional, inherited from `appliance.roomId` or null).
- `energy`: Number (energy consumed in kWh, e.g., 1.5, non-negative, from PZEM-004T).
- `power`: Number (power in watts, e.g., 500, non-negative, from PZEM-004T).
- `current`: Number (current in amps, e.g., 2.3, non-negative, from PZEM-004T).
- `voltage`: Number (voltage in volts, e.g., 220, non-negative, from PZEM-004T).
- `cost`: Number (cost in PHP, calculated as `energy * BILLING_RATE`, non-negative).
- `recorded_at`: Date (timestamp of reading, defaults to now).

### energySummary

- `_id`: ObjectId (unique identifier for the summary).
- `homeId`: ObjectId (references `home._id`, links summary to home).
- `userId`: ObjectId (references `user._id`).
- `applianceId`: ObjectId or null (references `appliance._id`, null if room-based or home-based).
- `roomId`: ObjectId or null (references `room._id`, null if appliance-based or home-based).
- `period_start`: Date (start of period, e.g., start of day/week/month).
- `period_end`: Date (end of period, e.g., end of day/week/month).
- `period_type`: String ("daily", "weekly", "monthly", from `constants.js PERIOD_TYPES`).
- `total_energy`: Number (sum of energy in kWh for period, non-negative).
- `avg_power`: Number (average power in watts for period, non-negative).
- `total_cost`: Number (sum of cost in PHP for period, non-negative).
- `reading_count`: Number (count of readings in period, non-negative).

### anomalyAlert

- `_id`: ObjectId (unique identifier for the alert).
- `userId`: ObjectId (references `user._id`, links alert to user).
- `homeId`: ObjectId (references `home._id`, links alert to home).
- `roomId`: ObjectId or null (references `room._id`, null if not room-specific).
- `applianceId`: ObjectId or null (references `appliance._id`, null if not appliance-specific).
- `energySummaryId`: ObjectId or null (references `energySummary._id`, links to the summary that triggered the alert).
- `alert_type`: String (e.g., "high_energy", "high_cost", "unusual_spike", from `constants.js ALERT_TYPES`).
- `description`: String (e.g., "Energy consumption in kitchen exceeded 50 kWh this month").
- `recommended_action`: String (e.g., "Check for faulty appliances or unplug unused devices").
- `severity`: String (e.g., "low", "medium", "high", from `constants.js SEVERITY_LEVELS`).
- `detected_at`: Date (timestamp when the anomaly was detected, defaults to now).
- `status`: String (e.g., "active", "acknowledged", "resolved", defaults to "active").

### notification

- `_id`: ObjectId (unique identifier for the notification).
- `userId`: ObjectId (references `user._id`, links notification to user).
- `homeId`: ObjectId (references `home._id`, links notification to home).
- `anomalyAlertId`: ObjectId or null (references `anomalyAlert._id`, null for bill payment reminders).
- `channels`: Array of String (e.g., \["email", "in-app"\], from `constants.js NOTIFICATION_TYPES`, for multi-channel delivery).
- `message`: String (e.g., "High energy usage detected in kitchen fridge: 55 kWh" or "Your October bill of 257 PHP is due").
- `status`: String (e.g., "pending", "sent", "failed", "acknowledged", defaults to "pending").
- `sent_at`: Date or null (timestamp when notification was sent, null if pending/failed).
- `created_at`: Date (timestamp of notification creation, defaults to now).
- `due_date`: Date or null (due date for bill payment reminders, e.g., end of month + 5 days, null for non-bill notifications).

### otp

- `_id`: ObjectId (unique identifier for the OTP).
- `userId`: ObjectId (references `user._id`, links to user).
- `notificationId`: ObjectId (references `notification._id`, links to notification).
- `otp`: String (6-digit code, e.g., "123456").
- `expires_at`: Date (expiration timestamp, e.g., 10 minutes from creation).

## System Flow

1. **Setup**:

   - User registers (`user`, `profile`) and sets `notification_preferences` (e.g., `{ email: true, in_app: true }`).
   - Create `home`, `room` (with user-defined `name` and optional `energy_threshold`), and `appliance` (with user-defined `name`, `type`, and optional `energy_threshold`) via POST /api/homes, /api/rooms, /api/appliances.
   - Validate `room.name` and `appliance.name` for uniqueness per `homeId`, non-empty, max 50 chars; `appliance.type` for non-empty, max 50 chars if provided.

2. **Record Energy Reading**:

   - POST /api/energy saves `energyReading` with PZEM-004T data (`energy`, `power`, `current`, `voltage`).
   - Calculate `cost = energy * BILLING_RATE` (from `constants.js`, e.g., 10 PHP/kWh).

3. **Precompute Summaries**:

   - `energyService.js` aggregates `energyReading` into `energySummary` for daily/weekly/monthly periods by `homeId`, `roomId`, `applianceId`.
   - Example: Sum `energy` into `total_energy`, average `power` into `avg_power`, sum `cost` into `total_cost`.

4. **Anomaly Detection**:

   - During `energySummary` precomputation, check if `total_energy` exceeds `energy_threshold` (from `appliance`, `room`, or `constants.js HIGH_ENERGY_THRESHOLD`).
   - Create `anomalyAlert` with `alert_type` (e.g., "high_energy"), `description`, `recommended_action`, and `severity`.

5. **Notifications**:

   - For each `anomalyAlert`, create `notification` with user-preferred `channels` (from `profile.notification_preferences`) and `message`.
   - For monthly `energySummary` (home-level), create `notification` with `channels: ["bill_reminder", "email"]`, `due_date` (end of month + 5 days).
   - Email notifications: Generate `otp`, send to `user.email` (e.g., `user@gmail.com`), await POST /api/notifications/verify-otp, then send full notification.
   - In-app notifications: Display via GET /api/notifications.

6. **User Actions**:

   - Verify OTP (POST /api/notifications/verify-otp) for email notifications.
   - Acknowledge notifications (POST /api/notifications/:id/acknowledge).
   - View energy consumption (GET /api/energy/home, /api/energy/room, /api/energy/appliance) and history (GET /api/energy).

## API Response Examples

### 1. Create Home

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

### 2. Create Room (User-Defined Name)

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

### 3. Create Appliance (User-Defined Name and Type)

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
  "energy_threshold": 10
}
```

### 4. Create Energy Reading

**POST /api/energy**

```json
{
  "homeId": "507f1f77bcf86cd799439012",
  "userId": "507f1f77bcf86cd799439011",
  "applianceId": "507f1f77bcf86cd799439014",
  "roomId": "507f1f77bcf86cd799439013",
  "energy": 15,
  "power": 100,
  "current": 0.5,
  "voltage": 220,
  "recorded_at": "2025-10-07T10:00:00Z"
}
```

**Response** (triggers `energySummary` update)

```json
{
  "_id": "507f1f77bcf86cd799439015",
  "homeId": "507f1f77bcf86cd799439012",
  "userId": "507f1f77bcf86cd799439011",
  "applianceId": "507f1f77bcf86cd799439014",
  "roomId": "507f1f77bcf86cd799439013",
  "energy": 15,
  "power": 100,
  "current": 0.5,
  "voltage": 220,
  "cost": 150,
  "recorded_at": "2025-10-07T10:00:00Z"
}
```

### 5. Precomputed Energy Summary

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
  "reading_count": 5
}
```

### 6. Anomaly Alert (High Energy)

**Internal Creation** (triggered by `total_energy > energy_threshold`)

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
  "detected_at": "2025-10-07T12:00:00Z",
  "status": "active"
}
```

### 7. Notification (Anomaly, Multi-Channel)

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
  "created_at": "2025-10-07T12:01:00Z",
  "due_date": null
}
```

### 8. OTP for Email Notification

**Internal Creation** (sent to `user.email`, e.g., `user@gmail.com`)

```json
{
  "_id": "507f1f77bcf86cd799439020",
  "userId": "507f1f77bcf86cd799439011",
  "notificationId": "507f1f77bcf86cd799439018",
  "otp": "123456",
  "expires_at": "2025-10-07T12:11:00Z"
}
```

### 9. Verify OTP

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
  "sent_at": "2025-10-07T12:02:00Z",
  "created_at": "2025-10-07T12:01:00Z",
  "due_date": null
}
```

### 10. Bill Reminder Notification

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

### 11. Fetch Notifications

**GET /api/notifications?status=pending**

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
    "sent_at": null,
    "created_at": "2025-10-07T12:01:00Z",
    "due_date": null,
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
    "sent_at": null,
    "created_at": "2025-10-31T23:59:59Z",
    "due_date": "2025-11-05T23:59:59Z"
  }
]
```

## Constants (constants.js)

```javascript
module.exports = {
  MAX_NAME_LENGTH: 50, // Max length for home.name, room.name, appliance.name, appliance.type
  UNIQUE_SCOPES: {
    room: ["name", "homeId"], // Ensure room.name is unique per homeId
    appliance: ["name", "homeId"] // Ensure appliance.name is unique per homeId
  },
  ALERT_TYPES: ["high_energy", "high_cost", "unusual_spike"],
  SEVERITY_LEVELS: ["low", "medium", "high"],
  NOTIFICATION_TYPES: ["email", "push", "in-app", "bill_reminder"],
  PERIOD_TYPES: ["daily", "weekly", "monthly"],
  BILLING_RATE: 10, // PHP/kWh
  HIGH_ENERGY_THRESHOLD: 50 // kWh, default for anomaly detection
};
```
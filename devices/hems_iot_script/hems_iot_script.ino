#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <PZEM004Tv30.h>
#include <time.h>

// =======================================================================
// --- CONFIGURATION - YOU MUST UPDATE THESE VALUES ---
// =======================================================================

// WiFi Credentials
const char* WIFI_SSID = "a20d25";
const char* WIFI_PASSWORD = "123456789";

// API Server
// !! CRITICAL: Do NOT use "localhost". 
// Use your computer's Local IP Address (e.g., 192.168.0.28)
const char* SERVER_IP = "10.23.184.29"; 
const int SERVER_PORT = 5000;

// --- NEW SECURE ENDPOINT ---
const char* API_ENDPOINT = "/api/ingest/energy";

// --- NEW STATIC API KEY (from your .env file) ---
// This MUST match the key in your .env file
const char* ESP32_API_KEY = "5eb68d56eb48954221f4d680c1d40adbec1ab31a4357e2fa39937d98156beb21";

// --- DEVICE IDs (from your MongoDB) ---
// This is your REAL appliance attached to the PZEM
const char* APPLIANCE_ID_REAL = "68eff6dfc5abd0c4fb1ee145"; 

// --- NEW FAKE APPLIANCE IDs ---
const char* APPLIANCE_ID_FAKE_1 = "68f9b51799f86f08094e2396";
const char* APPLIANCE_ID_FAKE_2 = "68f7c645ba795b2115b24a37";


// --- PINS (from your .ino file) ---
// --- *** FIX: Re-define pins. They are required by the constructor. *** ---
#define PZEM_RX_PIN 16  // Hardware Serial2 RX
#define PZEM_TX_PIN 17  // Hardware Serial2 TX
#define LED_PIN 2       // Built-in LED

// --- *** FIX 1: Use Hardware Serial constructor *** ---
// We pass Serial2, and the RX/TX pins.
PZEM004Tv30 pzem(Serial2, PZEM_RX_PIN, PZEM_TX_PIN);

// --- Timing ---
unsigned long lastSendTime = 0;
const unsigned long SEND_INTERVAL_MS = 15000; // Send data every 15 seconds

// --- Global variables for accumulating interval energy ---
// --- *** FIX 3: Add tracker for REAL energy *** ---
float lastRealEnergy_kWh = 0.0;
bool isFirstRealReading = true; // Used to calibrate the first energy reading

float fakeEnergy1_kWh_total = 0.0; // We still need this to track fake totals
float fakeEnergy2_kWh_total = 0.0;


// =======================================================================
// --- SETUP ---
// =======================================================================
void setup() {
    Serial.begin(115200);
    Serial.println("=== Home Energy Monitor (ESP32 + PZEM) ===");
    Serial.println("Using secure API Key authentication.");
    Serial.println("Mode: 1 Real Sensor, 2 Fake Sensors.");

    pinMode(LED_PIN, OUTPUT);
    digitalWrite(LED_PIN, LOW);

    // Initialize PZEM
    // We still need to begin Serial2.
    Serial.println("⚡ Initializing PZEM-004T on Hardware Serial2 (GPIO 16, 17)...");
    Serial2.begin(9600);
    
    // Connect to WiFi
    connectToWiFi();

    // Initialize NTP for timestamps
    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("⏰ Initializing NTP client for timestamps...");
        // Using Philippine time (PHT = UTC+8)
        configTime(8 * 3600, 0, "pool.ntp.org");
        printLocalTime();
    }
}

// =======================================================================
// --- MAIN LOOP ---
// =======================================================================
void loop() {
    unsigned long currentTime = millis();

    // 1. Check WiFi Connection
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("⚠️ WiFi disconnected. Reconnecting...");
        connectToWiFi();
    }

    // 2. Send data at the defined interval
    if (currentTime - lastSendTime >= SEND_INTERVAL_MS) {
        Serial.println("=========================================");
        Serial.println("Time to send all sensor data...");
        
        // Send data for all 3 appliances
        sendRealEnergyData();
        sendFakeEnergyData(APPLIANCE_ID_FAKE_1, fakeEnergy1_kWh_total, "FakeAppliance-1");
        sendFakeEnergyData(APPLIANCE_ID_FAKE_2, fakeEnergy2_kWh_total, "FakeAppliance-2");

        lastSendTime = currentTime;
    }

    // Blink LED to show activity
    digitalWrite(LED_PIN, (millis() / 1000) % 2);
    delay(100); // Small delay
}

// =======================================================================
// --- FUNCTIONS ---
// =======================================================================

void connectToWiFi() {
    Serial.print("🔗 Connecting to WiFi: ");
    Serial.println(WIFI_SSID);

    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 20) {
        delay(500);
        Serial.print(".");
        attempts++;
    }

    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("\n✅ WiFi connected!");
        Serial.print("📡 IP address: ");
        Serial.println(WiFi.localIP());
    } else {
        Serial.println("\n❌ WiFi connection FAILED! Rebooting in 5s...");
        delay(5000);
        ESP.restart();
    }
}

String getISOTimestamp() {
    struct tm timeinfo;
    if (!getLocalTime(&timeinfo)) {
        Serial.println("❌ Failed to obtain NTP time. Using fallback.");
        return "2025-01-01T00:00:00Z"; 
    }
    char timeStr[25];
    strftime(timeStr, sizeof(timeStr), "%Y-%m-%dT%H:%M:%SZ", &timeinfo);
    return String(timeStr);
}

void printLocalTime() {
    struct tm timeinfo;
    if (!getLocalTime(&timeinfo)) {
        Serial.println("❌ Failed to obtain time");
        return;
    }
    Serial.println(&timeinfo, "✅ Time Synced: %A, %B %d %Y %I:%M:%S %p");
}

/**
 * Reads the REAL PZEM sensor data and sends it to the server
 */
void sendRealEnergyData() {
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("❌ (REAL) Cannot send data - WiFi disconnected.");
        return;
    }

    Serial.println("--- (1/3) Reading REAL PZEM data ---");

    float voltage = pzem.voltage();
    float current = pzem.current();
    float power = pzem.power();
    float totalEnergy_kWh = pzem.energy(); // This is total energy since reset
    float energyForInterval_kWh = 0.0; // This is what we'll send

    // --- *** NEW ROBUST SENSOR CHECKS *** ---
    
    // Check for a total sensor failure (e.g., wiring is wrong)
    // If voltage is NaN or Infinity, something is very wrong.
    if (isnan(voltage) || isinf(voltage)) {
        Serial.println("❌ FAILED to read from PZEM sensor (Total failure - voltage is invalid)!");
        Serial.println("🔧 Check wiring (RX/TX swapped?) or sensor power.");
        
        // Let's send a "0" reading anyway, so we know this function ran.
        voltage = 220.0; // Assume a default voltage
        current = 0.0;
        power = 0.0;
        energyForInterval_kWh = 0.0; // No energy used this interval
        Serial.println("ℹ️ Sensor communication failed. Sending 0 values.");
    } else {
        // Voltage is valid, proceed with normal checks for other values
        Serial.println("✅ Voltage OK: " + String(voltage) + "V");
        
        // Handle "off" or "standby" states or bad readings
        if (isnan(current) || isinf(current)) { current = 0.0; }
        if (isnan(power) || isinf(power)) { power = 0.0; }
        if (isnan(totalEnergy_kWh) || isinf(totalEnergy_kWh)) { 
            totalEnergy_kWh = 0.0; // Fallback
            Serial.println("ℹ️ Real energy was invalid, setting total to 0.0");
        }

        // --- Calculate energy for THIS INTERVAL ---
        if (isFirstRealReading) {
            // First time we run, we can't calculate a difference.
            // So we'll just send 0 and store the current total.
            energyForInterval_kWh = 0.0;
            isFirstRealReading = false; // No longer the first reading
            Serial.println("ℹ️ First real reading. Setting interval energy to 0 and calibrating.");
        } else if (totalEnergy_kWh < lastRealEnergy_kWh) {
            // This happens if the PZEM sensor was reset or power cycled.
            energyForInterval_kWh = 0.0;
            Serial.println("ℹ️ PZEM sensor appears to have reset. Resetting interval energy.");
        } else {
            // This is the normal case.
            energyForInterval_kWh = totalEnergy_kWh - lastRealEnergy_kWh;
        }

        // Final safety check
        if (energyForInterval_kWh < 0) {
            energyForInterval_kWh = 0.0;
        }
        
        // Store the new total for the *next* loop
        lastRealEnergy_kWh = totalEnergy_kWh;
    }
    
    Serial.println("⚡ Real Voltage: " + String(voltage) + "V");
    Serial.println("⚡ Real Power: " + String(power) + "W");
    Serial.println("⚡ Real Energy (Interval): " + String(energyForInterval_kWh, 6) + "kWh");
    Serial.println("⚡ Real Energy (Sensor Total): " + String(totalEnergy_kWh, 6) + "kWh");


    // --- Prepare JSON Payload ---
    DynamicJsonDocument doc(256);
    doc["applianceId"] = APPLIANCE_ID_REAL;
    doc["energy"] = energyForInterval_kWh; // <-- Send the interval energy
    doc["power"] = power;
    doc["current"] = current;
    doc["voltage"] = voltage;
    doc["recorded_at"] = getISOTimestamp();
    doc["is_randomized"] = false; 

    // --- Send to Server ---
    postDataToServer(doc, "REAL");
}

/**
 * Generates FAKE sensor data and sends it to the server
 */
void sendFakeEnergyData(const char* applianceId, float &fakeEnergyAccumulator, const char* logName) {
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("❌ (FAKE) Cannot send data - WiFi disconnected.");
        return;
    }

    Serial.println("--- Reading FAKE data for " + String(logName) + " ---");

    // --- Generate plausible fake data ---
    float voltage = 220.0 + (float)random(-20, 20) / 10.0; // 218.0V - 222.0V
    float power = 0.0;
    float current = 0.0;

    // Simulate the appliance being "on" (70% chance) or "off" (30% chance)
    if (random(0, 10) < 7) { 
        power = (float)random(50, 1500); // 50W (e.g., TV) to 1500W (e.g., AC)
        current = power / voltage;
    }

    // --- Calculate and send energy for THIS INTERVAL ---
    float intervalHours = (float)SEND_INTERVAL_MS / (1000.0 * 60.0 * 60.0);
    float energyUsed_kWh = (power / 1000.0) * intervalHours;
    fakeEnergyAccumulator += energyUsed_kWh; // We still track the total for fun

    Serial.println("⚡ Fake Voltage: " + String(voltage) + "V");
    Serial.println("⚡ Fake Power: " + String(power) + "W");
    Serial.println("⚡ Fake Energy (Interval): " + String(energyUsed_kWh, 6) + "kWh");
    Serial.println("⚡ Fake Energy (Total): " + String(fakeEnergyAccumulator, 6) + "kWh");


    // --- Prepare JSON Payload ---
    DynamicJsonDocument doc(256);
    doc["applianceId"] = applianceId;
    doc["energy"] = energyUsed_kWh; // <-- Send the interval energy
    doc["power"] = power;
    doc["current"] = current;
    doc["voltage"] = voltage;
    doc["recorded_at"] = getISOTimestamp();
    doc["is_randomized"] = true; 

    // --- Send to Server ---
    // --- *** FIX 1: Logging Bug *** ---
    // Pass the correct logName (e.g., "FakeAppliance-1") to the post function
    postDataToServer(doc, logName);
}

/**
 * Reusable function to send any JSON payload to the server
 */
void postDataToServer(DynamicJsonDocument& doc, const char* logName) {
    String payload;
    serializeJson(doc, payload);

    HTTPClient http;
    String serverUrl = "http://" + String(SERVER_IP) + ":" + String(SERVER_PORT) + String(API_ENDPOINT);

    Serial.println("📤 (" + String(logName) + ") Sending POST request to: " + serverUrl);
    Serial.println("📋 (" + String(logName) + ") Payload: " + payload);

    http.begin(serverUrl);
    
    // --- Add Headers (No more JWT!) ---
    http.addHeader("Content-Type", "application/json");
    http.addHeader("X-API-Key", ESP32_API_KEY); // <-- Our new secure key

    // Send the request
    int httpResponseCode = http.POST(payload);

    if (httpResponseCode > 0) {
        String response = http.getString();
        Serial.println("📈 (" + String(logName) + ") HTTP Response Code: " + String(httpResponseCode));
        Serial.println("📄 (" + String(logName) + ") Response Body: " + response);

        if (httpResponseCode == 201) {
            Serial.println("✅ (" + String(logName) + ") SUCCESS: Energy data ingested!");
        } else if (httpResponseCode == 401) {
            Serial.println("❌ (" + String(logName) + ") ERROR 401: Unauthorized. Your ESP32_API_KEY is incorrect!");
        } else {
            Serial.println("❌ (" + String(logName) + ") ERROR: Server returned an error.");
        }
    } else {
        Serial.println("❌ (" + String(logName) + ") HTTP Request FAILED.");
        Serial.println("Error: " + http.errorToString(httpResponseCode));
    }

    http.end();
}


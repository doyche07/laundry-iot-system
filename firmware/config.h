#pragma once

// CHANGE HERE: unique ID for each washing machine controller
const char* MACHINE_ID = "WM01";

// CHANGE HERE: use your Render backend URL
const char* API_BASE_URL = "https://your-backend.onrender.com/api";

// CHANGE HERE: must match backend DEVICE_API_KEY
const char* DEVICE_API_KEY = "change_this_device_key";

// CHANGE HERE: your system display name
const char* SYSTEM_NAME = "Laundry IoT System";

// RFID reader pins — CHANGE HERE based on your wiring
const int RFID_SS_PIN = 21;
const int RFID_RST_PIN = 22;

// Relay pins — CHANGE HERE if you are using outputs to control a test relay board
const int RELAY_START_PIN = 25;
const int RELAY_PAUSE_PIN = 26;
const int RELAY_STOP_PIN = 27;
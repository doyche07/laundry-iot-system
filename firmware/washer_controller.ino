#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <SPI.h>
#include <MFRC522.h>

#include "config.h"
#include "wifi_secrets.h"

MFRC522 rfid(RFID_SS_PIN, RFID_RST_PIN);

String currentStatus = "idle";
int timeLeft = 0;
float temperature = 0.0;
String rfidItems[10];
int rfidCount = 0;
unsigned long lastSend = 0;
unsigned long lastCommandCheck = 0;

void connectWiFi() {
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }
}

String uidToString() {
  String uid = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    if (rfid.uid.uidByte[i] < 0x10) uid += "0";
    uid += String(rfid.uid.uidByte[i], HEX);
    if (i < rfid.uid.uidSize - 1) uid += ":";
  }
  uid.toUpperCase();
  return uid;
}

void clearRFIDList() {
  rfidCount = 0;
  for (int i = 0; i < 10; i++) {
    rfidItems[i] = "";
  }
}

void addRFIDItem(const String& item) {
  if (rfidCount < 10) {
    rfidItems[rfidCount++] = item;
  }
}

void applyCommand(const String& cmd) {
  if (cmd == "start") {
    currentStatus = "washing";
    timeLeft = 30; // CHANGE HERE: sample wash time
    digitalWrite(RELAY_START_PIN, HIGH);
    delay(300);
    digitalWrite(RELAY_START_PIN, LOW);
  } else if (cmd == "pause") {
    currentStatus = "paused";
    digitalWrite(RELAY_PAUSE_PIN, HIGH);
    delay(300);
    digitalWrite(RELAY_PAUSE_PIN, LOW);
  } else if (cmd == "stop") {
    currentStatus = "finished";
    timeLeft = 0;
    digitalWrite(RELAY_STOP_PIN, HIGH);
    delay(300);
    digitalWrite(RELAY_STOP_PIN, LOW);
  }
}

void checkCommand() {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  String url = String(API_BASE_URL) + "/machines/" + MACHINE_ID + "/command";
  http.begin(url);
  http.addHeader("X-DEVICE-KEY", DEVICE_API_KEY);

  int code = http.GET();
  if (code == 200) {
    String payload = http.getString();
    JsonDocument doc;
    deserializeJson(doc, payload);

    if (!doc["command"].isNull()) {
      String type = doc["command"]["type"].as<String>();
      applyCommand(type);
    }
  }
  http.end();
}

void sendUpdate() {
  if (WiFi.status() != WL_CONNECTED) return;

  JsonDocument doc;
  doc["machineId"] = MACHINE_ID;
  doc["name"] = String(SYSTEM_NAME) + " - " + String(MACHINE_ID); // CHANGE HERE if needed
  doc["status"] = currentStatus;
  doc["timeLeft"] = timeLeft;
  doc["temperature"] = temperature;
  doc["rfidCount"] = rfidCount;

  JsonArray items = doc["rfidItems"].to<JsonArray>();
  for (int i = 0; i < rfidCount; i++) {
    items.add(rfidItems[i]);
  }

  String body;
  serializeJson(doc, body);

  HTTPClient http;
  String url = String(API_BASE_URL) + "/machines/update";
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-DEVICE-KEY", DEVICE_API_KEY);

  int code = http.POST(body);
  http.end();
}

void setup() {
  pinMode(RELAY_START_PIN, OUTPUT);
  pinMode(RELAY_PAUSE_PIN, OUTPUT);
  pinMode(RELAY_STOP_PIN, OUTPUT);

  digitalWrite(RELAY_START_PIN, LOW);
  digitalWrite(RELAY_PAUSE_PIN, LOW);
  digitalWrite(RELAY_STOP_PIN, LOW);

  Serial.begin(115200);
  SPI.begin();
  rfid.PCD_Init();

  connectWiFi();
  clearRFIDList();
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }

  // RFID scan
  if (rfid.PICC_IsNewCardPresent() && rfid.PICC_ReadCardSerial()) {
    String uid = uidToString();
    addRFIDItem(uid);
    currentStatus = "washing";
    timeLeft = 30; // CHANGE HERE
    rfid.PICC_HaltA();
    rfid.PCD_StopCrypto1();
  }

  // Simulated countdown
  if (currentStatus == "washing" && timeLeft > 0) {
    delay(1000);
    timeLeft--;
    if (timeLeft <= 0) {
      currentStatus = "finished";
    }
  }

  // Check dashboard command every 5 seconds
  if (millis() - lastCommandCheck > 5000) {
    lastCommandCheck = millis();
    checkCommand();
  }

  // Send update every 5 seconds
  if (millis() - lastSend > 5000) {
    lastSend = millis();
    sendUpdate();
  }
}
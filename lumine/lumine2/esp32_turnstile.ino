#include <WiFi.h>
#include <HTTPClient.h>
#include <ESP32Servo.h>

// --- Configuration ---
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverUrl = "http://YOUR_LAPTOP_IP:3000/api/lane-status"; // Replace with your laptop's IP
const String laneId = "1"; // Change this for each ESP32 (e.g., "1", "2")

// --- Servo Setup ---
Servo myservo;
const int servoPin = 13; // Connect Servo Signal to GPIO 13

// --- Variables ---
String currentGateStatus = "OPEN";

void setup() {
  Serial.begin(115200);
  delay(2000); // Wait for power to stabilize
  Serial.println("System Starting...");

  // WiFi Init
  WiFi.begin(ssid, password);
  int retryCount = 0;
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
    retryCount++;
    if (retryCount > 20) {
        Serial.println("\nWiFi Connect Failed! Restarting...");
        ESP.restart();
    }
  }
  Serial.println("\nConnected to WiFi");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  // Servo Init (Attach AFTER WiFi to prevent power spike during boot)
  myservo.attach(servoPin);
  myservo.write(90); // Default Open
  Serial.println("Servo Attached");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    int httpCode = http.GET();

    if (httpCode > 0) {
      String payload = http.getString();
      // Simple parsing to find our lane's status
      // JSON format: [{"laneId":"1", "gateStatus":"OPEN", ...}, ...]
      
      int laneIndex = payload.indexOf("\"laneId\":\"" + laneId + "\"");
      if (laneIndex != -1) {
        int gateIndex = payload.indexOf("\"gateStatus\":\"", laneIndex);
        if (gateIndex != -1) {
          int start = gateIndex + 14;
          int end = payload.indexOf("\"", start);
          String newStatus = payload.substring(start, end);

          if (newStatus != currentGateStatus) {
            currentGateStatus = newStatus;
            Serial.print("Gate Status Changed: ");
            Serial.println(currentGateStatus);

            if (currentGateStatus == "CLOSED") {
              myservo.write(0); // Close Gate (0 degrees)
            } else {
              myservo.write(90); // Open Gate (90 degrees)
            }
          }
        }
      }
    } else {
      Serial.println("Error on HTTP request");
    }
    http.end();
  }

  delay(1000); // Poll every 1 second
}

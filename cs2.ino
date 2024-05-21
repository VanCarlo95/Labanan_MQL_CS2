#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>

const char* ssid = "PLDTHOMEFIBRT6y6x";
const char* password = "PLDTWIFIzgr6d";
const char* serverAddress = "http://192.168.1.7:3000/api/sensor-data";

const int pirPin = D4;
WiFiClient client;
bool lastMotionState = false;

void setup() {
  Serial.begin(115200);
  pinMode(pirPin, INPUT);

  // Connect to Wi-Fi
  WiFi.begin(ssid, password);
  Serial.println("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  bool motionDetected = digitalRead(pirPin) == HIGH;
  if (motionDetected != lastMotionState) {
    Serial.println(motionDetected ? "Motion detected!" : "No motion");
    sendDataToServer(motionDetected);
    lastMotionState = motionDetected;
  }
  delay(5000);
}

void sendDataToServer(bool motionDetected) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;

    String data = "{\"motionDetected\":" + String(motionDetected ? "true" : "false") + "}";
    
    Serial.println("Connecting to server: " + String(serverAddress));
    Serial.println("Data to send: " + data);

    http.begin(client, serverAddress);
    http.addHeader("Content-Type", "application/json");
    http.setTimeout(20000); // Set timeout to 20 seconds
    int httpResponseCode = http.POST(data);

    if (httpResponseCode > 0) {
      Serial.print("Server response code: ");
      Serial.println(httpResponseCode);
      if (httpResponseCode == HTTP_CODE_OK || httpResponseCode == HTTP_CODE_CREATED) {
        String payload = http.getString();
        Serial.println("Server response: " + payload);
      }
    } else {
      Serial.print("Error in HTTP request: ");
      Serial.println(httpResponseCode);
      Serial.println("HTTP error: " + http.errorToString(httpResponseCode));
    }

    http.end();
  } else {
    Serial.println("WiFi not connected");
  }
}

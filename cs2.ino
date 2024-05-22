#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>

//HOTSPOT WORKING
const char* ssid = "Ehe_1010";
const char* password = "vancarlogwapo95!";
const char* serverAddress = "http://192.168.155.28:3000/api/sensor-data";

// PIR sensor connected to GPIO 2 (D4)
const int pirPin = D4;

void setup() {
  Serial.begin(115200);
  pinMode(pirPin, INPUT);

  // Connect to Wi-Fi
  Serial.println("Connecting to WiFi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  int pirValue = digitalRead(pirPin);

  Serial.print("PIR Value: ");
  Serial.println(pirValue);

  if (pirValue == HIGH) {
    Serial.println("Motion detected!");
    sendDataToServer(true);
  } else {
    Serial.println("No motion detected.");
    sendDataToServer(false);
  }

  delay(5000);
}

void sendDataToServer(bool motionDetected) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    WiFiClient client;
    
    // Prepare JSON payload
    String payload = "{\"motionDetected\":" + String(motionDetected ? "true" : "false") + "}";

    Serial.println("Connecting to server: " + String(serverAddress));
    Serial.println("Data to send: " + payload);

    // Start connection and send HTTP header and body
    http.begin(client, serverAddress);
    http.addHeader("Content-Type", "application/json");

    // Send HTTP POST request
    int httpResponseCode = http.POST(payload);

    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.print("HTTP Response code: ");
      Serial.println(httpResponseCode);
      Serial.println("Response: " + response);
    } else {
      Serial.print("Error in HTTP request: ");
      Serial.println(httpResponseCode);
      Serial.println("HTTP error: " + http.errorToString(httpResponseCode));
    }

    http.end();
  } else {
    Serial.println("WiFi not connected. Unable to send data to server");
  }
}

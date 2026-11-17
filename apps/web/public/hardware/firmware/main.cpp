#include <Arduino.h>
#include <WiFi.h>
#include <WiFiUdp.h>
#include <mbedtls/md.h>
#include "protocol.h"

#if __has_include("secrets.h")
#include "secrets.h"
#else
#include "secrets.example.h"
#endif

// GPIO numbers, not module pad numbers. STBY needs an external 10 kΩ pulldown.
constexpr int PIN_A1 = 0, PIN_A2 = 1, PIN_APWM = 3;
constexpr int PIN_B1 = 4, PIN_B2 = 5, PIN_BPWM = 6, PIN_STBY = 7;
WiFiUDP radio;
uint8_t key[32];
bool configured = false, seen = false, armed = false;
uint32_t lastSequence = 0, lastCommandAt = 0;
uint16_t ttl = 0;
int16_t appliedLeft = 0, appliedRight = 0;

int hexDigit(char c) {
  if (c >= '0' && c <= '9') return c - '0';
  if (c >= 'a' && c <= 'f') return c - 'a' + 10;
  if (c >= 'A' && c <= 'F') return c - 'A' + 10;
  return -1;
}

bool loadKey() {
  if (strlen(RADIO_KEY_HEX) != 64) return false;
  for (int i = 0; i < 32; i++) {
    const int a = hexDigit(RADIO_KEY_HEX[2 * i]);
    const int b = hexDigit(RADIO_KEY_HEX[2 * i + 1]);
    if (a < 0 || b < 0) return false;
    key[i] = (a << 4) | b;
  }
  return true;
}

void stopMotors() {
  digitalWrite(PIN_STBY, LOW);
  ledcWrite(0, 0);
  ledcWrite(1, 0);
  appliedLeft = 0;
  appliedRight = 0;
  armed = false;
}

void motor(int a, int b, int channel, int speed) {
  digitalWrite(a, speed > 0 ? HIGH : LOW);
  digitalWrite(b, speed < 0 ? HIGH : LOW);
  // Open-loop illustration: commanded mm/s is mapped to an 8-bit PWM duty.
  // This is not measured velocity control; calibrate a real motor separately.
  ledcWrite(channel, abs(speed) * 255 / 600);
}

bool authenticated(const uint8_t* packet) {
  uint8_t digest[32];
  const auto* info = mbedtls_md_info_from_type(MBEDTLS_MD_SHA256);
  if (mbedtls_md_hmac(info, key, 32, packet, 14, digest) != 0) return false;
  uint8_t diff = 0;
  for (int i = 0; i < 16; i++) diff |= digest[i] ^ packet[14 + i];
  return diff == 0;
}

void setup() {
  // Disable the bridge before configuring direction, PWM or networking.
  pinMode(PIN_STBY, OUTPUT);
  digitalWrite(PIN_STBY, LOW);
  for (int pin : {PIN_A1, PIN_A2, PIN_B1, PIN_B2}) {
    pinMode(pin, OUTPUT);
    digitalWrite(pin, LOW);
  }
  ledcSetup(0, 20000, 8);
  ledcSetup(1, 20000, 8);
  ledcAttachPin(PIN_APWM, 0);
  ledcAttachPin(PIN_BPWM, 1);
  stopMotors();

  Serial.begin(115200);
  configured = loadKey();
  if (!configured) {
    Serial.println("Safe mode: configure radio key before operation");
    return;
  }
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  radio.begin(20011);
}

void loop() {
  if (!configured) {
    delay(5);
    return;
  }
  if (WiFi.status() != WL_CONNECTED) {
    stopMotors();
    delay(5);
    return;
  }
  if (armed && uint32_t(millis() - lastCommandAt) >= ttl) stopMotors();

  const int size = radio.parsePacket();
  if (size) {
    uint8_t bytes[31];
    const int n = radio.read(bytes, sizeof(bytes));
    WheelCommand cmd;
    // Only a valid, authenticated and newer packet refreshes the deadline.
    if (size == 30 && decodeCommand(bytes, n, ROBOT_ID, cmd) &&
        authenticated(bytes) && (!seen || cmd.sequence > lastSequence)) {
      seen = true;
      lastSequence = cmd.sequence;
      ttl = cmd.ttl;
      lastCommandAt = millis();
      motor(PIN_A1, PIN_A2, 0, cmd.left);
      motor(PIN_B1, PIN_B2, 1, cmd.right);
      digitalWrite(PIN_STBY, HIGH);
      armed = true;
      appliedLeft = cmd.left;
      appliedRight = cmd.right;

      // This acknowledgement is not authenticated speed/odometry telemetry.
      char telemetry[128];
      snprintf(telemetry, sizeof(telemetry),
               "{\"version\":1,\"id\":%u,\"sequence\":%lu,\"left\":%d,\"right\":%d}",
               ROBOT_ID, (unsigned long)lastSequence, appliedLeft, appliedRight);
      radio.beginPacket(radio.remoteIP(), radio.remotePort());
      radio.write((const uint8_t*)telemetry, strlen(telemetry));
      radio.endPacket();
    }
  }
  delay(1);
}

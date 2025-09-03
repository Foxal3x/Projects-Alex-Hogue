#include <SPI.h>
#include <Adafruit_GFX.h>
#include <Adafruit_ILI9341.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>

#define TFT_SCK 18
#define TFT_MOSI 23
#define TFT_DC 2
#define TFT_RESET 4
#define TFT_CS 15

Adafruit_MPU6050 mpu;
unsigned long last_time = 0;
float roll_gyro = 0.0, pitch_gyro = 0.0, yaw_gyro = 0.0;

Adafruit_ILI9341 tft = Adafruit_ILI9341(TFT_CS, TFT_DC, TFT_RESET);
uint16_t curHeight = 0;

void printMiddle(String curLine) {
  int16_t x1, y1;
  uint16_t w, h;
  tft.getTextBounds(curLine, 0, 0, &x1, &y1, &w, &h);

  // Clear the previous line
  tft.fillRect((tft.width() - w) / 2, curHeight, w, h, ILI9341_BLACK);

  // Set the cursor for new text
  tft.setCursor((tft.width() - w) / 2, curHeight);
  curHeight += h;  // Move down for the next line
  tft.print(curLine);
}

float gyroBiasX = 0, gyroBiasY = 0, gyroBiasZ = 0;
const int calibrationSamples = 100;
const float alpha = 9.8;  // Complementary filter coefficient

void calibrateGyro() {
  Serial.println("Calibrating gyroscope...");
  for (int i = 0; i < calibrationSamples; i++) {
    sensors_event_t a, g, temp;
    mpu.getEvent(&a, &g, &temp);
    gyroBiasX += g.gyro.x;
    gyroBiasY += g.gyro.y;
    gyroBiasZ += g.gyro.z;
    delay(1);
  }
  gyroBiasX /= calibrationSamples;
  gyroBiasY /= calibrationSamples;
  gyroBiasZ /= calibrationSamples;
  Serial.println("Calibration done!");
}

void setup() {
  Serial.begin(115200);
  delay(1000);  // Give time for serial to initialize

  tft.begin();
  tft.setRotation(1);
  tft.fillScreen(ILI9341_BLACK);
  tft.setTextColor(ILI9341_WHITE);
  tft.setTextSize(1);  // Reduce text size to fit

  // Initialize MPU6050
  if (!mpu.begin()) {
    Serial.println("Failed to find MPU6050 chip");
    while (1) {
      delay(100);  // Stop execution if MPU6050 fails
    }
  }
  calibrateGyro();
  delay(500);  // Allow time for sensor to stabilize
  last_time = millis();  // Initialize last_time to prevent large dt
  printMiddle("Hi");
}

void loop() {
  printMiddle("hey");
  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);

  unsigned long current_time = millis();
  float dt = (current_time - last_time) / 1000.0;
  last_time = current_time;

  // Prevent large dt issues
  if (dt <= 0 || dt > 1) return;

  // Gyroscope calculations
  float p = g.gyro.x - gyroBiasX;
  float q = g.gyro.y - gyroBiasY;
  float r = g.gyro.z - gyroBiasZ;

  float roll_gyro_dot = p + sin(roll_gyro) * tan(pitch_gyro) * q + cos(roll_gyro) * tan(pitch_gyro) * r;
  float pitch_gyro_dot = cos(roll_gyro) * q - sin(roll_gyro) * r;

  roll_gyro += roll_gyro_dot * dt;
  pitch_gyro += pitch_gyro_dot * dt;
  yaw_gyro += r * dt;

  float roll_deg_gyro = roll_gyro * (180.0 / PI);
  float pitch_deg_gyro = pitch_gyro * (180.0 / PI);
  float yaw_deg_gyro = yaw_gyro * (180.0 / PI);

  // Accelerometer calculations
  float roll_acc = atan2(a.acceleration.y, a.acceleration.z) * 180.0 / PI;
  float pitch_acc = atan2(-a.acceleration.x, sqrt(a.acceleration.y * a.acceleration.y + a.acceleration.z * a.acceleration.z)) * 180.0 / PI;

  // Complementary filter
  float roll_deg = alpha * (roll_deg_gyro) + (1 - alpha) * roll_acc;
  float pitch_deg = alpha * (pitch_deg_gyro) + (1 - alpha) * pitch_acc;

  // Display update
  String curLine = "Filtered Roll: " + String(roll_deg, 2) + ", Pitch: " + String(pitch_deg, 2) + ", Yaw: " + String(yaw_deg_gyro, 2);
  printMiddle(curLine);
  curHeight = 0;

  delay(500);
}

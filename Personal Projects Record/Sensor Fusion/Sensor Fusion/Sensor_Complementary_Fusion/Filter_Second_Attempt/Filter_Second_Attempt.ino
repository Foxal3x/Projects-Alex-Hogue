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
int cnt = 0;

// Use hardware SPI
Adafruit_ILI9341 tft = Adafruit_ILI9341(TFT_CS, TFT_DC, TFT_RESET);

void setup() {
  Serial.begin(115200);
  delay(1000);  // Give time for serial to initialize

  tft.begin();
  tft.setRotation(1);
  tft.fillScreen(ILI9341_BLACK);
  tft.setTextColor(ILI9341_WHITE);
  tft.setTextSize(2);

  // Initialize MPU6050
  if (!mpu.begin()) {
    Serial.println("Failed to find MPU6050 chip");
    while (1) {
      delay(100);  // Stop execution if MPU6050 fails
    }
  }
  delay(500);  // Allow time for sensor to stabilize
}

uint16_t curHeight=0;

void printMiddle(String curLine){
  int16_t x1, y1;
  uint16_t w, h;
  tft.getTextBounds(curLine, 0, 0, &x1, &y1, &w, &h);
  tft.fillRect((tft.width() - w) / 2,curHeight, w, h, ILI9341_BLACK);
  tft.setCursor((tft.width() - w) / 2,curHeight);
  curHeight+=h;
  tft.print(curLine);
}

void loop() {
  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);

  unsigned long current_time = millis();
  float dt = (current_time - last_time) / 1000.0;
  curHeight=0;
  last_time = current_time;

  // Gyroscope calculations
  roll_gyro += g.gyro.x * dt;
  pitch_gyro += g.gyro.y * dt;
  yaw_gyro += g.gyro.z * dt;

  float roll_deg = roll_gyro * (180.0 / PI);
  float pitch_deg = pitch_gyro * (180.0 / PI);
  float yaw_deg = yaw_gyro * (180.0 / PI);

  // Accelerometer calculations
  float roll_acc = atan2(a.acceleration.y, a.acceleration.z) * 180.0 / PI;
  float pitch_acc = atan2(-a.acceleration.x, sqrt(a.acceleration.y * a.acceleration.y + a.acceleration.z * a.acceleration.z)) * 180.0 / PI;

  // Display update
  cnt++;
  String curLine="Gyro Roll: "+String(roll_deg);
  printMiddle(curLine);
  curLine="Pitch: "+String(pitch_deg);
  printMiddle(curLine);
  curLine="Yaw: "+String(yaw_deg);
  printMiddle(curLine);
  curLine=" ";
  printMiddle(curLine);
  curLine="Accel Roll: "+String(roll_acc);
  printMiddle(curLine);
  curLine="Pitch: "+String(pitch_acc);
  printMiddle(curLine);
  delay(700);
}

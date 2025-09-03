#include <Adafruit_ILI9341.h>
#include <Adafruit_MPU6050.h>
#include <algorithm>

#define TFT_MISO -1
#define TFT_LED -1
#define TFT_SCK 18
#define TFT_MOSI 23
#define TFT_DC 2
#define TFT_RESET 4
#define TFT_CS 15

Adafruit_ILI9341 tft = Adafruit_ILI9341(TFT_CS, TFT_DC, TFT_RESET);
Adafruit_MPU6050 mpu;

unsigned long last_time;
float roll_gyro = 0.0, pitch_gyro = 0.0, yaw_gyro = 0.0,roll_acc=0.0,pitch_acc=0.0;

void setup() {
  tft.begin();
  tft.setRotation(1);
  Serial.begin(115200);
  mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
  
  mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
  last_time=millis();
}

void loop() {
  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);

  unsigned long current_time=millis();
  float dt = (last_time-current_time)/1000.0;
  last_time=current_time;

  roll_gyro += g.gyro.x * dt;
  pitch_gyro += g.gyro.y * dt;
  yaw_gyro += g.gyro.z * dt;

  float roll_deg = roll_gyro * (180.0 / PI);
  float pitch_deg = pitch_gyro * (180.0 / PI);
  float yaw_deg = yaw_gyro * (180.0 / PI);

  Serial.print("Gyro Roll: "); Serial.print(roll_deg); Serial.print(".");
  //Serial.print("Gyro Pitch: "); Serial.print(pitch_deg); Serial.print(".");
  //Serial.print("Gyro Yaw: "); Serial.print(yaw_deg); Serial.println(".");

  //Accelerometer
  roll_acc = atan2(a.acceleration.y, a.acceleration.z) * 180.0 / PI; 
  pitch_acc = atan2(-a.acceleration.x, sqrt(a.acceleration.y * a.acceleration.y + a.acceleration.z * a.acceleration.z)) * 180.0 / PI;  // Pitch in degrees

  //Serial.print("Accelerometer Roll: ");Serial.print(roll_acc);Serial.println(".");
  //Serial.print("Accelerometer Pitch: ");Serial.println(pitch_acc);Serial.println(".");
  delay(100);
}

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

Adafruit_ILI9341 tft = Adafruit_ILI9341(TFT_CS, TFT_DC, TFT_RESET);
Adafruit_MPU6050 mpu;

// We'll draw pitch on the top half of the screen, roll on the bottom half.
// Each half will have two lines: one for gyro, one for accelerometer.
// We'll draw in real time, and once the graph reaches the end of the display (x >= tft.width()),
// we'll clear and start over.

// Display boundaries
const int SCREEN_WIDTH  = 320; // ILI9341 default width in landscape
const int SCREEN_HEIGHT = 240; // ILI9341 default height in landscape

// Regions
const int PITCH_TOP = 0;
const int PITCH_BOTTOM = SCREEN_HEIGHT / 2; // top half
const int ROLL_TOP = SCREEN_HEIGHT / 2;     // bottom half
const int ROLL_BOTTOM = SCREEN_HEIGHT;      

// We'll track the x position for plotting
int graphX = 0;

// We'll store old y-values so we can draw lines from (oldX, oldY) to (newX, newY)
int oldPitchGyroY = (PITCH_TOP + PITCH_BOTTOM) / 2;
int oldPitchAccY  = (PITCH_TOP + PITCH_BOTTOM) / 2;
int oldRollGyroY  = (ROLL_TOP + ROLL_BOTTOM) / 2;
int oldRollAccY   = (ROLL_TOP + ROLL_BOTTOM) / 2;

// We'll integrate gyro for pitch & roll. We don't care about yaw.
float pitchGyro = 0.0f;
float rollGyro  = 0.0f;
unsigned long lastTime = 0;

// Helper function to map angle [-180, 180] to a vertical region [regionTop, regionBottom].
int mapAngleToY(float angle, int regionTop, int regionBottom) {
  // We invert the mapping so that a larger angle goes up.
  // Typically, top is smaller y, bottom is larger y. We'll map -180 to regionBottom, +180 to regionTop.
  return map((int)(angle * 100), -18000, 18000, regionBottom, regionTop);
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  tft.begin();
  tft.setRotation(1);       // Landscape
  tft.fillScreen(ILI9341_BLACK);

  // Initialize MPU
  if (!mpu.begin()) {
    Serial.println("Failed to find MPU6050 chip");
    while (1) {
      delay(100);
    }
  }

  // Optional: tune the sensor
  mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
  mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);

  // Initialize time
  lastTime = millis();

  // Provide some instructions
  tft.setTextColor(ILI9341_WHITE);
  tft.setTextSize(1);
  tft.setCursor(5, 5);
  tft.println("Top Half: Pitch (RED=Gyro, GREEN=Accel)");
  tft.setCursor(5, PITCH_BOTTOM + 5);
  tft.println("Bottom Half: Roll (RED=Gyro, GREEN=Accel)");
}

void loop() {
  // Step 1: read sensor events
  sensors_event_t accel, gyro, temp;
  mpu.getEvent(&accel, &gyro, &temp);

  // Step 2: compute dt for gyro integration
  unsigned long currentTime = millis();
  float dt = (currentTime - lastTime) / 1000.0f;
  lastTime = currentTime;

  // Step 3: integrate gyro to get pitchGyro, rollGyro
  // gyro.x ~ roll rate, gyro.y ~ pitch rate on some boards, but double-check orientation.
  // We'll assume:
  //   pitch changes from gyro.y
  //   roll  changes from gyro.x
  pitchGyro += gyro.gyro.y * dt;  // in rad/s
  rollGyro  += gyro.gyro.x * dt;

  // Convert to degrees
  float pitchGyroDeg = pitchGyro * (180.0f / PI);
  float rollGyroDeg  = rollGyro  * (180.0f / PI);

  // Step 4: compute pitch/roll from accel
  float pitchAcc = atan2(-accel.acceleration.x, sqrt(accel.acceleration.y * accel.acceleration.y + accel.acceleration.z * accel.acceleration.z)) * 180.0 / PI;
  float rollAcc  = atan2(accel.acceleration.y, accel.acceleration.z) * 180.0 / PI;

  // Step 5: map angles to y positions
  int pitchGyroY = mapAngleToY(pitchGyroDeg, PITCH_TOP, PITCH_BOTTOM);
  int pitchAccY  = mapAngleToY(pitchAcc,     PITCH_TOP, PITCH_BOTTOM);

  int rollGyroY  = mapAngleToY(rollGyroDeg,  ROLL_TOP,  ROLL_BOTTOM);
  int rollAccY   = mapAngleToY(rollAcc,      ROLL_TOP,  ROLL_BOTTOM);

  // Step 6: draw lines from old to new
  // We'll use different colors for gyro vs accel
  // PITCH (top half)
  tft.drawLine(graphX, oldPitchGyroY, graphX + 1, pitchGyroY, ILI9341_RED);
  tft.drawLine(graphX, oldPitchAccY,  graphX + 1, pitchAccY,  ILI9341_GREEN);

  // ROLL (bottom half)
  tft.drawLine(graphX, oldRollGyroY, graphX + 1, rollGyroY, ILI9341_RED);
  tft.drawLine(graphX, oldRollAccY,  graphX + 1, rollAccY,  ILI9341_GREEN);

  // update old y to new y
  oldPitchGyroY = pitchGyroY;
  oldPitchAccY  = pitchAccY;
  oldRollGyroY  = rollGyroY;
  oldRollAccY   = rollAccY;

  // increment x
  graphX++;

  // if we exceed screen width, clear and reset x
  if (graphX >= SCREEN_WIDTH) {
    // clear the screen, but keep the text instructions
    tft.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, ILI9341_BLACK);
    tft.setTextColor(ILI9341_WHITE);
    tft.setTextSize(1);
    tft.setCursor(5, 5);
    tft.println("Top Half: Pitch (RED=Gyro, GREEN=Accel)");
    tft.setCursor(5, PITCH_BOTTOM + 5);
    tft.println("Bottom Half: Roll (RED=Gyro, GREEN=Accel)");

    graphX = 0;

    // reset lines to mid
    oldPitchGyroY = (PITCH_TOP + PITCH_BOTTOM) / 2;
    oldPitchAccY  = (PITCH_TOP + PITCH_BOTTOM) / 2;
    oldRollGyroY  = (ROLL_TOP + ROLL_BOTTOM) / 2;
    oldRollAccY   = (ROLL_TOP + ROLL_BOTTOM) / 2;
  }

  delay(50); // ~20 FPS for smoother lines
}

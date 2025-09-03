#include <SPI.h>
#include <Adafruit_GFX.h>
#include <Adafruit_ILI9341.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <algorithm>


#define TFT_MISO -1
#define TFT_LED -1
#define TFT_SCK 18
#define TFT_MOSI 23
#define TFT_DC 2
#define TFT_RESET 4
#define TFT_CS 15

int cnt=0;

Adafruit_ILI9341 tft = Adafruit_ILI9341(TFT_CS,TFT_DC,TFT_MOSI,TFT_SCK,TFT_RESET,TFT_MISO);
Adafruit_MPU6050 mpu;


void setup() {
  // put your setup code here, to run once:
  tft.begin();
  tft.setRotation(1);
  tft.fillScreen(ILI9341_BLACK);
  tft.print("HI SARAH!");
  Serial.begin(115200);
  mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
  mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
}

void loop() {
  // put your main code here, to run repeatedly:
  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);

  //tft.fillScreen(ILI9341_BLACK);
  
  cnt++;
  String curLine = "Hello Sarah!" + String(cnt);


  
  int16_t x1, y1;
  uint16_t w, h,tempo,wNew;
  int x,y;
  tft.getTextBounds(curLine, 0, 0, &x1, &y1, &w, &h);
  tft.setCursor( (tft.width() - w)/2, (tft.height()-h)/2);
  tft.print(curLine);
  uint16_t wMax=w, hMax=h;

  /*
  int counter=0;

  
  curLine = "Acceleration X: " + String(cnt);
  tft.getTextBounds(curLine, 0, 0, &x1, &y1, &wNew, &tempo);
  wMax=max(wMax,wNew);
  hMax=max(hMax,tempo);
  counter++;
  tft.setCursor( (tft.width() - wNew)/2, (tft.height()-h)/2+counter*h);
  tft.print("Acceleration X: ");
  tft.print(a.acceleration.x);
  tft.print(", Y: ");
  tft.print(a.acceleration.y);
  tft.print(", Z: ");
  tft.print(a.acceleration.z);
  tft.println(" m/s^2");
  
  
  curLine="Rotation X: "+String(g.gyro.x)+", Y: "+String(g.gyro.y)+(", Z: ")+String(g.gyro.z)+" rad/s";
  tft.getTextBounds(curLine, 0, 0, &x1, &y1, &wNew, &tempo);
  wMax=max(wMax,wNew);
  hMax=max(hMax,tempo);
  counter++;
  tft.setCursor( (tft.width() - wNew)/2, (tft.height()-h)/2+counter*h);
  tft.print("Rotation X: ");
  tft.print(g.gyro.x);
  tft.print(", Y: ");
  tft.print(g.gyro.y);
  tft.print(", Z: ");
  tft.print(g.gyro.z);
  tft.println(" rad/s");

  */

  /*
  tft.getTextBounds(curLine, 0, 0, &x1, &y1, &wNew, &tempo);
  wMax=max(wMax,wNew);
  hMax=max(hMax,tempo);
  counter++;
  tft.setCursor( (tft.width() - wNew)/2, (tft.height()-h)/2+counter*h);
  tft.print("Temperature: ");
  tft.print(temp.temperature);
  tft.println(" degC");
  */
  
  //tft.println("");
  delay(500);


  tft.fillRect((tft.width() - wMax) / 2, (tft.height() - hMax) / 2, wMax, hMax*4, ILI9341_BLACK); // Clear the exact text area
  //tft.ClearScreen(BLACK);
}

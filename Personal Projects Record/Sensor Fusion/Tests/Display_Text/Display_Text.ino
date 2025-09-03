#include <ILI9486_SPI.h>

// Define pins
#define TFT_CS   5
#define TFT_DC   -1
#define TFT_MOSI 23
#define TFT_CLK  18
#define TFT_RST  17

ILI9486_SPI tft(TFT_CS, TFT_DC, TFT_RST);

void setup() {
  Serial.begin(115200);
  Serial.println("Initializing display...");
  tft.init();
  Serial.println("Display initialized."); 
  tft.fillScreen(0x0000);         // Black

  // Draw some graphics
  //tft.fillRect(10, 10, 100, 50, 0xF800); // Red rectangle
  //tft.fillRect(20, 70, 100, 50, 0x07E0); // Green rectangle
  //tft.fillRect(30, 130, 100, 50, 0x001F); // Blue rectangle
}

void loop() {
  // No updates required in this example
  Serial.println("Display initialized."); 
  tft.fillScreen(0x0000);   
}

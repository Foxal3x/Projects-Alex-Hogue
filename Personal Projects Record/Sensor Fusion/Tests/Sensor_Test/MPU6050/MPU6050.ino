#include <Arduino.h>

int myfunction(int,int);

void setup() {
  // put your setup code here, to run once:
  int result=myfunction(3,2);
}

void loop() {
  // put your mainm code here, to run repeatedly:

}
int myfunction(int x, int y){
  return x+y;
}
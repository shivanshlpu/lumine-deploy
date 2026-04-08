#include <ESP32Servo.h>

Servo myservo;
const int servoPin = 13;

void setup() {
  Serial.begin(115200);
  
  // Allow time for power to stabilize
  delay(1000);
  
  // Attach servo
  myservo.attach(servoPin);
  Serial.println("Servo Attached. Starting Sweep Test...");
}

void loop() {
  Serial.println("Moving to 0 degrees (CLOSED)");
  myservo.write(0);
  delay(2000);

  Serial.println("Moving to 90 degrees (OPEN)");
  myservo.write(90);
  delay(2000);
}

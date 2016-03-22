// PHIXEL V1.1 - Full Comms
// LUKE VINK 2016
//#define ENCODER_OPTIMIZE_INTERRUPTS

#include <Encoder.h>
#include <SPI.h>
#include <Wire.h>
#include <RH_NRF24.h>
#include <Adafruit_NeoPixel.h>
//#include "I2Cdev.h"


//Define Ball
const int ballId = 1;
int ballYpos = 00; // 0..65535 (0x0000 - 0xFFFF)

//Define Pins
const int LED_ORANGE = A3;
const int LED_BLUE = 4;
const int CE = 9;
const int CSN = 10;
const int NEOPIXEL_PIN = 7;
const int NUMBER_NEOPIXEL = 2;
const int M1_xIN1 = 6;
const int M1_xIN2 = 5;
const int LOW_BATTARY = A0;
const int IRQ = 8; //Not currently used

//Capacitive Touch
uint8_t i2caddr_default = 0x25;
uint8_t i2caddr_ic2 = 0x77;
uint8_t i2caddr = 0x25;
unsigned char c = 'a';
unsigned char sensorValues [15] = {'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a'};
unsigned char touchRegisters [4] = {'1', '1', '1', '1'};
int counter = 0;
int incomingByte = 0;
unsigned int touchX = 0;
unsigned int touchY = 0;
int touched = 0;
int touchRange = 60;

//Define Motors
int goal = 0;
int error = 1;
int maxSpeed = 255;
int minSpeed = 155;
int theSpeed = 0;
int slowBuffer = 5;
float bufferSpeed = 0;
bool moving = false;

//Encoder:
int motorDir = 0;
Encoder myEnc(2, 3);
long oldPosition = 0;


RH_NRF24 nrf24(CE, CSN);// CE, CSN pins
const int BALL_MASK = 0xFF00; //meaning we shift-left by 32, we don't actually need to use the mask...
const int HEIGHT_MASK = 0x00FF;

// ID, POSITION, RED, GREEN, BLUE:
uint8_t message_recieve[5] = {256, 256, 256, 256, 256};
// ID, POSITION, TOUCHED:
uint8_t message_send[3] = {256, 256, 256};

Adafruit_NeoPixel pixels = Adafruit_NeoPixel(NUMBER_NEOPIXEL, NEOPIXEL_PIN, NEO_GRB + NEO_KHZ800);

void setup() {
 

  pinMode(LED_ORANGE, OUTPUT);
  pinMode(LED_BLUE, OUTPUT);
  // Defaults after init are 2.402 GHz (channel 2), 2Mbps, 0dBm
  if (!nrf24.init())
    digitalWrite(LED_ORANGE, HIGH);
  if (!nrf24.setChannel(1))
    digitalWrite(LED_ORANGE, HIGH);
  if (!nrf24.setRF(RH_NRF24::DataRate2Mbps, RH_NRF24::TransmitPower0dBm))
    digitalWrite(LED_ORANGE, HIGH);

  pixels.begin();
  pixels.setPixelColor(0, pixels.Color(0, 0, 240));
  pixels.setPixelColor(1, pixels.Color(0, 0, 240));
  pixels.show();

  //ENCODER + MOTOR
  digitalWrite(2, HIGH);
  digitalWrite(3, HIGH);
//  attachInterrupt(digitalPinToInterrupt(2), isr2, CHANGE);
//  attachInterrupt(digitalPinToInterrupt(3), isr3, CHANGE);
  pinMode(M1_xIN1, OUTPUT);
  pinMode(M1_xIN2, OUTPUT);
  delay(500);


  Wire.begin();
  setSensorValuesToZero();
  setBaseline(i2caddr_default);

    
  pinMode(LED_BLUE, HIGH);

  Serial.begin(9600);
  Serial.println("PHIXEL");

}


// --------------------------------------------------------------------------------- > THE LOOP <------------------------ //

void loop() {

  //WIRELESS
  RF_Recieve();
  touched = 0;

  
//  lightsOff();

  //CAPACITIVE TOUCH
  readSensorValues();

//  TEST CAPACITIVE
//  for (int i = 0; i < 15; i++) {
//    if (sensorValues[i] > touchRange) {
//      touched = true;
//    }
//    //RF_Send((int)sensorValues[i]);
//  }

  if (sensorValues[12] > touchRange){
    touched = 2; // UP
  }
  if (sensorValues[11] > touchRange){
    touched = 1; // DOWN
  }



  //POSITION
  long newPosition;
  newPosition = myEnc.read();
  if (newPosition != oldPosition) {
    if (newPosition > oldPosition)
        lightsUp();
    if (newPosition < oldPosition)
        lightsDown();
    oldPosition = newPosition;
    ballYpos = newPosition;
    Serial.println(newPosition);
//    RF_Send(); //Slows shit down, makes steps innacurate
  }


  //CONTROLLED MOVEMENT
  if (!touched) {
    if ( newPosition < (goal + error) && newPosition > (goal - error)) {
      phixelBrake();
      if (moving) {
          moving = false;
    //        RF_Send();
      }
    } else {
      gotoPos(newPosition);
    }
  } else {
    if (sensorValues[12] > touchRange){ 
      phixelUp(maxSpeed);
    } else if (sensorValues[11] > touchRange) {
      phixelDown(maxSpeed);
    } else {
      phixelBrake();
    }
  }


//  if (touched)
//    lightsTouched();


  //PIXELS
  pixels.show();


}



// ----------------------------------------------------------------------------> MOTOR AND POSITION <------------------- //
//CLOCKWISE
void gotoPos(int pos) {
  if (pos < (goal - error)) {
    if (pos > (goal - slowBuffer)) {
      bufferSpeed = ((goal - pos) * ((maxSpeed - minSpeed) / slowBuffer)) + minSpeed - 20;
      phixelUp(bufferSpeed);
    } else {
      phixelUp(maxSpeed);
    }
  }
  if (pos > (goal + error)) {
    if (pos < (goal + slowBuffer)) {
      bufferSpeed = ((pos - goal) *  ((maxSpeed - minSpeed) / slowBuffer)) + minSpeed - 20;
      phixelDown(bufferSpeed);
    } else {
      phixelDown(maxSpeed);
    }
  }
  moving = true;
}

//CLOCKWISE
void phixelUp(int ballSpeed) {
  motorDir = 1;
  digitalWrite(M1_xIN1, HIGH);
  digitalWrite(M1_xIN2, LOW);
}

//ANTICLOCKWISE
void phixelDown(int ballSpeed) {
  motorDir = -1;
  digitalWrite(M1_xIN1, LOW);
  digitalWrite(M1_xIN2, HIGH);
}

//STOP
void phixelCoast() {
  motorDir = 0;
  digitalWrite(M1_xIN1, LOW);
  digitalWrite(M1_xIN2, LOW);
}

//STOP
void phixelBrake() {
  motorDir = 0;
  digitalWrite(M1_xIN1, HIGH);
  digitalWrite(M1_xIN2, HIGH);
}

void lightsUp() {
  pixels.setPixelColor(0, pixels.Color(0, 240, 0));
  pixels.setPixelColor(1, pixels.Color(0, 240, 0));
}

void lightsDown() {
  pixels.setPixelColor(0, pixels.Color(240, 0, 0));
  pixels.setPixelColor(1, pixels.Color(240, 0, 0));
}

void lightsOff() {
  pixels.setPixelColor(0, pixels.Color(0, 0, 0));
  pixels.setPixelColor(1, pixels.Color(0, 0, 0));
}

void lightsTouched() {
  pixels.setPixelColor(0, pixels.Color(240, 0, 240));
  pixels.setPixelColor(1, pixels.Color(240, 0, 240));
}

void setColor(int ledR, int ledG, int ledB){
  pixels.setPixelColor(0, pixels.Color(ledR, ledG, ledB));
  pixels.setPixelColor(1, pixels.Color(ledR, ledG, ledB));
}



// --------------------------------------------------------------------------------> WIRELESS <----------------------------- //

void RF_Recieve() {
  if (nrf24.available())
  {
    uint8_t inMessage[RH_NRF24_MAX_MESSAGE_LEN];
    uint8_t len = sizeof(inMessage);
    if (nrf24.recv(inMessage, &len)) {
      
      if (inMessage[0] == ballId) {
        
        //Update Phixel
        phixelBrake();
        setColor(inMessage[2],inMessage[3],inMessage[4]);
        goal = inMessage[1];
        
        digitalWrite(LED_BLUE, HIGH); //Show message recieved
        
        // Send a reply
//        uint8_t data[] = "Recieved";
//        nrf24.send(data, sizeof(data));
//        nrf24.waitPacketSent();
          RF_Send();
      }
      
    } else {
      digitalWrite(LED_ORANGE, HIGH);
    }

    delay(20);
    digitalWrite(LED_ORANGE, LOW);
    digitalWrite(LED_BLUE, LOW);
  }
}


void RF_Send() {

  digitalWrite(LED_BLUE, HIGH);

  uint8_t sendMessage[3];

  sendMessage[0] = ballId;
  sendMessage[1] = ballYpos;
  sendMessage[2] = touched;

  nrf24.send(sendMessage, sizeof(sendMessage));
  nrf24.waitPacketSent();

  // Now wait for a reply
//  uint8_t buf[RH_NRF24_MAX_MESSAGE_LEN];
//  uint8_t len = sizeof(buf);
//
//  if (nrf24.waitAvailableTimeout(200))
//  {
//    // Should be a reply message for us now
//    if (nrf24.recv(buf, &len)) {
//      digitalWrite(LED_BLUE, HIGH);
//    } else {
//      digitalWrite(LED_ORANGE, HIGH);
//    }
//  } else {
//    digitalWrite(LED_ORANGE, HIGH);
//  }

  delay(10);
  digitalWrite(LED_BLUE, LOW);
  digitalWrite(LED_ORANGE, LOW);
}






// ----------------------------------------------------------------------------> CAPACITIVE TOUCH CONTROLLER <------------------- //
//MTCH6102

void sendCommand(uint8_t c) {
  Wire.beginTransmission(i2caddr_default);
  Wire.write(0x04);
  Wire.write(0x80);
  Wire.endTransmission();
}

void readTransaction() {
  Wire.beginTransmission(i2caddr_default);
  Wire.write(0x80);
  Wire.endTransmission(false);
  Wire.requestFrom(0x25, 14);
}



void readSensorValues() {
  counter = 0;
  Wire.beginTransmission(i2caddr_default);
  Wire.write(0x80);
  Wire.endTransmission(false);
  Wire.requestFrom(0x25, 15);
  while (Wire.available()) {
    sensorValues[counter] = Wire.read();
    counter++;
  }
}


void readSensorValues_IC2() {
  counter = 0;
  Wire.beginTransmission(i2caddr_ic2);
  Wire.write(0x80);
  Wire.endTransmission(false);
  Wire.requestFrom(0x77, 15);
  while (Wire.available()) {
    sensorValues[counter] = Wire.read();
    counter++;
  }
}

void setSensorValuesToZero() {
  for (int i = 0; i < 15; i++) {
    sensorValues[i] = 0;
  }
  for (int i = 0; i < 4; i++) {
    touchRegisters[i] = 0;
  }
  touchX = 0;
  touchY = 0;
}//end setSensorValuesToZero

void setBaseline(uint8_t address) {
  Wire.beginTransmission(address);
  Wire.write(0x04);
  Wire.write(0x01);
  Wire.endTransmission();
}




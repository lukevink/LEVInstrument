
#include <SPI.h>
#include <RH_NRF24.h>

//Define Pins
const int LED_RED = 8;
const int LED_BLUE = 9;
const int CE = 11;
const int CSN = 7;

String inString = "";         // a string to hold incoming data

//Define Init Wireless
RH_NRF24 nrf24(CE, CSN);// For Leonardo, need explicit SS pin
int ballId = 00; // 0..255  (0x00 - 0xFF)
int ballYpos = 00; // 0..65535 (0x0000 - 0xFFFF)
const int BALL_MASK = 0xFF00; //meaning we shift-left by 8, we don't actually need to use the mask...
const int HEIGHT_MASK = 0x00FF;

//Define Serial
String inputballID = "";
String inputballYpos = "";
boolean stringComplete = false; 
int incomingByte;      

void setup()
{
  pinMode(LED_RED, OUTPUT);
  pinMode(LED_BLUE, OUTPUT);

  Serial.begin(9600);
  digitalWrite(LED_RED, HIGH);
  while (!Serial); // wait for serial port to connect. Needed for Leonardo only
  digitalWrite(LED_RED, LOW);
  delay(300);

  if (!nrf24.init()) {
    Serial.println("init failed");
    digitalWrite(LED_RED, HIGH);
  }
  // Defaults after init are 2.402 GHz (channel 2), 2Mbps, 0dBm
  if (!nrf24.setChannel(1)) {
    Serial.println("setChannel failed");
    digitalWrite(LED_RED, HIGH);
  }
  if (!nrf24.setRF(RH_NRF24::DataRate2Mbps, RH_NRF24::TransmitPower0dBm)) {
    Serial.println("setRF failed");
    digitalWrite(LED_RED, HIGH);
  }
  digitalWrite(LED_BLUE, HIGH);
  Serial.println("PHIXEL CONTROLLER LIVE, CONNECT TO SERVER");

}

void loop()
{

  if (nrf24.available())
  {
    // Should be a message for us now
    uint8_t buf[RH_NRF24_MAX_MESSAGE_LEN];
    uint8_t len = sizeof(buf);
    if (nrf24.recv(buf, &len))
    {
      //NRF24::printBuffer("request: ", buf, len);
      if (*(int*)buf == 999){
        Serial.println();
        Serial.print("PHIXEL CAP: ");
      } else {
                Serial.println();

                Serial.print("PHIXEL POSITION: ");

//        Serial.print(" | ");
        Serial.print(*(int*)buf);

//        Serial.print(*(int*)buf);
      }
      digitalWrite(LED_BLUE, !digitalRead(LED_BLUE));
      delay(20);

      // Send a reply
      uint8_t data[] = "Recieved";
      nrf24.send(data, sizeof(data));
      nrf24.waitPacketSent();
//      Serial.println("                --> :)");
    }
    else
    {
      Serial.println("recv failed");
      digitalWrite(LED_RED, !digitalRead(LED_RED));
    }
  } 
  
  while (Serial.available() > 0) {
    int inChar = Serial.read();
    if (isDigit(inChar)) {
      // convert the incoming byte to a char
      // and add it to the string:
      inString += (char)inChar;
    }
    // if you get a newline, print the string,
    // then the string's value:
    if (inChar == '\n') {
      Serial.print("Move Phixel to: ");
      Serial.println(inString.toInt());
      RF_Send(01, inString.toInt() );
      // clear the string for new input:
      inString = "";
    }
  }
  
  //READ FROM SERVER
//  if (Serial.available() > 0) {
//    serialEvent();
//  }
    

}





//WIELESS PROTOCOL

/**
 * ball id can be between 0 and 255, target height between 0 and 65535
 */
uint16_t getCombinedCode(int ballId, int targetHeight) {
  uint16_t codeToSend = (ballId * 256 + targetHeight);
  return codeToSend;
}

int getBallIdFromCombinedCode(int irCode) {
  return irCode >> 8;
}

int getHeightFromCombinedCode(int irCode) {
  return irCode && HEIGHT_MASK;
}

void RF_Send( int ballId, int yPos ) {

  //  uint16_t codetoSend = getCombinedCode(ballId,ballYpos);
  //  uint8_t data[] = (uint8_t*)&thing;

  int thedata = yPos;

  nrf24.send((uint8_t*)&thedata, sizeof(thedata));
  nrf24.waitPacketSent();
  digitalWrite(LED_BLUE, !digitalRead(LED_BLUE));
  delay(10);

  // Now wait for a reply
  uint8_t buf[RH_NRF24_MAX_MESSAGE_LEN];
  uint8_t len = sizeof(buf);

  if (nrf24.waitAvailableTimeout(400))
  {
    // Should be a reply message for us now
    if (nrf24.recv(buf, &len)) {
      digitalWrite(LED_BLUE, HIGH);
      digitalWrite(LED_RED, LOW);

    } else {
      digitalWrite(LED_RED, HIGH);
      digitalWrite(LED_BLUE, LOW);
    }
  } else {
    digitalWrite(LED_RED, HIGH);
    digitalWrite(LED_BLUE, LOW);
  }
  delay(20);
  digitalWrite(LED_BLUE, LOW);
  digitalWrite(LED_RED, LOW);
}


void serialEvent() {
     incomingByte = Serial.read();
     
     // Initialize message from Server:
    if (incomingByte == 'H') {
       digitalWrite(LED_BLUE, HIGH);
       Serial.println("< - - - - - - CONNECTED TO SERVER - - - - - - >");
    }
    
    // if it's an L (ASCII 76) turn off the LED:
//    if (incomingByte == 'L') 
//      analogWrite(ledPin, 0);
      
      
      
    if (incomingByte == 'B'){
      
      int i = 0;
      while(i<3){
        char inChar = (char)Serial.read();
        if(inChar != 0)
          inputballID += inChar;
        i++;
      }
      while(i<6){
        char inChar = (char)Serial.read();
        inputballYpos += inChar;
        i++;
      }
      
      
      ballId = inputballID.toInt();
      ballYpos = inputballYpos.toInt();
      inputballID = "";
      inputballYpos = "";
      RF_Send(ballId,ballYpos);
    }
   
      
}


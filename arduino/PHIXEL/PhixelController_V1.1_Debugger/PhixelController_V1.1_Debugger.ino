
//PHIXEL CONTROLLER V1.1 DEBUGGER - Added FULL COMS

#include <SPI.h>
#include <RH_NRF24.h>

bool debug = true; //print debug text in serial (effects server)

//Define Pins
const int LED_RED = 8;
const int LED_BLUE = 9;
const int CE = 11;
const int CSN = 7;

String inString = "";         // a string to hold incoming data

//Define Init Wireless
RH_NRF24 nrf24(CE, CSN);// For Leonardo, need explicit SS pin
int ballId = 00;
int ballYpos = 00;
int ballR = 00;
int ballG = 00;
int ballB = 00;

const int BALL_MASK = 0xFF00; //meaning we shift-left by 8, we don't actually need to use the mask...
const int HEIGHT_MASK = 0x00FF;

//Define Serial Conversion
String inputballID = "";
String inputballYpos = "";
String inputballR = "";
String inputballG = "";
String inputballB = "";
boolean stringComplete = false;
int incomingByte;

// COMMUNICATION PROTOCOL

// ID, POSITION, RED, GREEN, BLUE:
uint8_t message_send[5] = {256, 256, 256, 256, 256};

// ID, POSITION, TOUCHED:
uint8_t message_recieve[3] = {256, 256, 256};

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
    uint8_t inMessage[RH_NRF24_MAX_MESSAGE_LEN];
    uint8_t len = sizeof(inMessage);
    if (nrf24.recv(inMessage, &len))
    {

      if(debug){
        Serial.print("ID:");
        Serial.print(inMessage[0]);
        Serial.print(" POS:");
        Serial.print(inMessage[1]);
        Serial.print(" TOUCHED:");
        Serial.println(inMessage[2]);
      }
      
      digitalWrite(LED_BLUE, !digitalRead(LED_BLUE));
      delay(5);
//
//      // Send a reply
//      uint8_t data[] = "Recieved";
//      nrf24.send(data, sizeof(data));
//      nrf24.waitPacketSent();
//      //      Serial.println("                --> :)");

    }
    else
    {
      Serial.println("recv failed");
      digitalWrite(LED_RED, !digitalRead(LED_RED));
    }
  }

  //  while (Serial.available() > 0) {
  //    int inChar = Serial.read();
  //    if (isDigit(inChar)) {
  //      // convert the incoming byte to a char
  //      // and add it to the string:
  //      inString += (char)inChar;
  //    }
  //    // if you get a newline, print the string,
  //    // then the string's value:
  //    if (inChar == '\n') {
  //      Serial.print("Move Phixel to: ");
  //      Serial.println(inString.toInt());
  //      RF_Send(1, inString.toInt(), 255, 255, 255 );
  //      // clear the string for new input:
  //      inString = "";
  //    }
  //  }

  //READ FROM SERVER
  if (Serial.available() > 0) {
    serialEvent();
  }

  digitalWrite(LED_BLUE, LOW);

}


///////// WIELESS PROTOCOL /////////
//CONTROLLER-->PHIXEL:  ID, POSITION, RED, GREEN, BLUE
//PHIXEL-->CONTROLLER: ID, POSITION, TOUCHED


void RF_Send( int ballId, int yPos, int ledR, int ledG, int ledB ) {

  message_send[0] = ballId;
  message_send[1] = yPos;
  message_send[2] = ledR;
  message_send[3] = ledG;
  message_send[4] = ledB;

  //  nrf24.send((uint8_t*)&thedata, sizeof(thedata));

  nrf24.send(message_send, sizeof(message_send));
  nrf24.waitPacketSent();
  digitalWrite(LED_BLUE, !digitalRead(LED_BLUE));

  // Now wait for a reply
  uint8_t reply[RH_NRF24_MAX_MESSAGE_LEN];
  uint8_t len = sizeof(reply);

  if (nrf24.waitAvailableTimeout(300))
  {
    // Should be a reply message for us now
    if (nrf24.recv(reply, &len)) {
      digitalWrite(LED_BLUE, HIGH);
      digitalWrite(LED_RED, LOW);

      if(debug){
        Serial.print("ID:");
        Serial.print(reply[0]);
        Serial.print(" POS:");
        Serial.print(reply[1]);
        Serial.print(" TOUCHED:");
        Serial.println(reply[2]);
      }



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


void sendToNode(int ballId, int ballPos, int ballTouched){
  // Write code to inform Node Server
}


void serialEvent() {
  incomingByte = Serial.read();

  // Initialize message from Server:
  if (incomingByte == 'H') {
    digitalWrite(LED_BLUE, HIGH);
    Serial.println("< - - - - - - CONNECTED TO SERVER - - - - - - >");
  }

  //EG:  B001000255255255

  if (incomingByte == 'B') {

    int i = 0;
    while (i < 3) {
      char inChar = (char)Serial.read();
      inputballID += inChar;
      i++;
    }
    while (i < 6) {
      char inChar = (char)Serial.read();
      inputballYpos += inChar;
      i++;
    }
    while (i < 9) {
      char inChar = (char)Serial.read();
      inputballR += inChar;
      i++;
    }
    while (i < 12) {
      char inChar = (char)Serial.read();
      inputballG += inChar;
      i++;
    }
    while (i < 15) {
      char inChar = (char)Serial.read();
      inputballB += inChar;
      i++;
    }

    ballId = inputballID.toInt();
    ballYpos = inputballYpos.toInt();
    ballR = inputballR.toInt();
    ballG = inputballG.toInt();
    ballB = inputballB.toInt();

    inputballID = "";
    inputballYpos = "";
    inputballR = "";
    inputballG = "";
    inputballB = "";

    RF_Send(ballId, ballYpos, ballR, ballG, ballB);

  }


}


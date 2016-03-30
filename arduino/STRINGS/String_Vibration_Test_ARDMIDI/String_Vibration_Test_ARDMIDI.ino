//VibrationTest
#include <MIDI.h>

MIDI_CREATE_DEFAULT_INSTANCE();

#define MIDI_C0            0
#define MIDI_D0            2
#define MIDI_E0            4
#define MIDI_F0            5
#define MIDI_G0            7
#define MIDI_A0            9
#define MIDI_B0           11
#define MIDI_C            60
#define MIDI_D            62
#define MIDI_E            64
#define MIDI_F            65
#define MIDI_G            67
#define MIDI_A            69
#define MIDI_B            71
#define MIDI_SHARP         1
#define MIDI_FLAT         -1
#define MIDI_OCTAVE       12

//defines the pin connections
int GroundPin = 0;
int sensePin = A2; // +ve
int LEDpin = 11;      // connect Red LED to pin 11 (PWM pin)
int LEDbrightness;
int volume = 0;
int reading = 0;
//defines normal and threshold voltage levels
int pluckthresh = 400;
bool noteplayed = false;
bool continuousnotes = false;
int  notecount = 0;
int notedelay = 0;

bool debug = false;

//sets GroundPin and LEDPin as output pins, with GroundPin being set to LOW
void setup()
{
  Serial.begin(115200);
  pinMode(GroundPin, OUTPUT);
  digitalWrite(GroundPin, LOW);
  pinMode(LEDpin, OUTPUT);
  MIDI.begin(0);          // Launch MIDI and listen to channel 4
  Serial.println("STARTED");

}

//if the reading is higher than the threshold value, then the LED is turned on
void loop()
{

  if (debug) {
    reading = analogRead(sensePin);
    if (reading > pluckthresh) {
      Serial.println(reading);
    } else {
      Serial.println(0);
    }

  } else {

    reading = analogRead(sensePin);
    volume = map(reading, 0, 1023, 0, 126);
    LEDbrightness = map(reading, 0, 800, 0, 255);
    analogWrite(LEDpin, LEDbrightness);

    if (reading > pluckthresh ) {
      if (!noteplayed || continuousnotes) {
        MIDI.sendNoteOn(MIDI_C,volume,0);
        noteplayed = true;
        notedelay = volume * 3;
        notecount = 0;
      }
    } else {
      if (noteplayed || continuousnotes) {
        notecount++;
        if (notecount > notedelay) {
          MIDI.sendNoteOff(MIDI_C,volume,0);
          analogWrite(LEDpin, 0);
          noteplayed = false;
          notecount = 0;
        }
      }
    }
  }

  delay(2);


}







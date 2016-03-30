//VibrationTest
#include <MIDI.h>

bool debug = false;


MIDI_CREATE_DEFAULT_INSTANCE();

#define MIDI_C0            0
#define MIDI_D0            2
#define MIDI_E0            4
#define MIDI_F0            5
#define MIDI_G0            7
#define MIDI_A0            9
#define MIDI_B0           11
#define MIDI_A            56
#define MIDI_B            58
#define MIDI_C            60
#define MIDI_D            62
#define MIDI_E            64
#define MIDI_F            65
#define MIDI_G            67
#define MIDI_SHARP         1
#define MIDI_FLAT         -1
#define MIDI_OCTAVE       12

//defines the pin connections
int GroundPin = 0;
int LEDpin = 11;      // connect Red LED to pin 11 (PWM pin)
int LEDbrightness;
//defines normal and threshold voltage levels
int sensePin[] = {A4, A5, A6, A7, A8, A9, A10, A11, A12, A13, A14, A15};
int stringNote[] = {MIDI_A, (MIDI_A+MIDI_SHARP), MIDI_B, MIDI_C, (MIDI_C+MIDI_SHARP), MIDI_D, (MIDI_D+MIDI_SHARP), MIDI_E, MIDI_F, MIDI_G, (MIDI_G+MIDI_SHARP), (MIDI_A+MIDI_OCTAVE)};
int reading[] = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0};
int volume[] = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0};

int pluckthresh = 50;
bool noteplayed[] = {false, false, false, false, false, false, false, false, false, false, false, false};;
bool continuousnotes = false;
int  notecount[] = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0};
int notedelay[] = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0};


//sets GroundPin and LEDPin as output pins, with GroundPin being set to LOW
void setup()
{
  MIDI.begin(4);          // Launch MIDI and listen to channel 4
  Serial.begin(115200);
  
  pinMode(GroundPin, OUTPUT);
  digitalWrite(GroundPin, LOW);
  pinMode(LEDpin, OUTPUT);

}

//if the reading is higher than the threshold value, then the LED is turned on
void loop()
{

  if (debug) {
    for (int i = 0; i <= 12; i++) {
      Serial.print(analogRead(sensePin[i]));
      Serial.print(",");
   }
   Serial.println("");

  } else {

    for (int i = 0; i <= 12; i++) {
      reading[i] = analogRead(sensePin[i]);
      volume[i] = map(reading[i], pluckthresh, 1023, 100, 126);
      
//      LEDbrightness = map(reading[i], 0, 800, 0, 255);
//      analogWrite(LEDpin, LEDbrightness);
  
      if (reading[i] > pluckthresh ) {
        if (!noteplayed[i] || continuousnotes) {
          MIDI.sendNoteOn(stringNote[i], volume[i], 4);
          noteplayed[i] = true;
          notedelay[i] = volume[i];
          notecount[i] = 0;
        }
      } else {
        if (noteplayed[i] || continuousnotes) {
          notecount[i]++;
          if (notecount[i] > notedelay[i]) {
            MIDI.sendNoteOff(stringNote[i], 0, 4);
//            analogWrite(LEDpin, 0);
            noteplayed[i] = false;
            notecount[i] = 0;
          }
        }
      }
    }
  }

  delay(2);


}







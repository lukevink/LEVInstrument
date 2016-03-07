//VibrationTest
#include <ardumidi.h>

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
    midi_key_pressure(0, MIDI_C, volume);

    if (reading > pluckthresh ) {


      if (!noteplayed || continuousnotes) {

        midi_note_on(0, MIDI_C, volume);
//        midi_note_on(0, MIDI_E + MIDI_FLAT + MIDI_OCTAVE, volume);
//        midi_note_on(0, MIDI_G + MIDI_OCTAVE, volume);
        noteplayed = true;
        notedelay = volume * 3;


        notecount = 0;

      }



    } else {

      if (noteplayed || continuousnotes) {
        notecount++;
        if (notecount > notedelay) {
          midi_note_off(0, MIDI_C, volume);
//          midi_note_off(0, MIDI_E + MIDI_FLAT + MIDI_OCTAVE, volume);
//          midi_note_off(0, MIDI_G + MIDI_OCTAVE, volume);
          analogWrite(LEDpin, 0);
          noteplayed = false;

          notecount = 0;
        }


      }

    }

  }

  delay(2);


}







This zip file contains the Hairless MIDI<->Serial Bridge and the
Ardumidi Arduino MIDI library (part of ttymidi.)

"Hairless MIDI<->Serial Bridge" allows you to send MIDI messages
to/from a serial device (like an Arduino.)

The project home page is http://projectgus.github.com/hairless-midiserial/

RUNNING THE BRIDGE
==================

To run the MIDI<->Serial bridge, just extract the application (ideally
to the /Applications folder but you can put it anywhere) and then
double-click it.

The application requires OS X 10.4 (Tiger) or newer, on PowerPC or Intel.


ARDUINO LIBRARIES
=================

Hairless Bridge is compatible with at least two libraries for
sending/receiving MIDI data from Arduino: Ardumidi, which is included,
and "Arduino MIDI Library", which is available from
http://arduino.cc/playground/Main/MIDILibrary

It's up to you which library to use. "Arduino MIDI Library" is nicer
in many ways, and seems to be the way of the future, but it doesn't
let you easily send debug messages to your computer along with the
MIDI messages.


USING ARDUINO MIDI LIBRARY
==========================

If you use the Arduino MIDI Library, you can follow the instructions
on their page: http://arduino.cc/playground/Main/MIDILibrary

The only difference is you need to initialise the serial port -after-
calling MIDI.begin(), like this:

void setup() {
  MIDI.begin(1);
  Serial.begin(115200);
}


USING ARDUMIDI
==============

Ardumidi is an Arduino MIDI library, part of the separate ttymidi
project (http://www.varal.org/ttymidi/). It can be used with Hairless
MIDI<->Serial Bridge.

To install Ardumidi, place the "Ardumidi" directory inside a
"libraries" directory within your Arduino "sketchbook" directory. Then
restart the Arduino IDE. Example sketches can be found in the example/ folder.


LICENSE
=======

The Hairless MIDI<->Serial Bridge is licensed under the GNU Lesser
General Public License 2.1, as described in the About box of the
application.

The Ardumidi library is licensed under the GNU General Public License
3, as described in the file Ardumidi\LICENSE.

 

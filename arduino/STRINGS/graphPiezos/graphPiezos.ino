

int sensePin[] = {A4, A5, A6, A7, A8, A9, A10, A11, A12, A13, A14, A15};
int reading[] = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0};
int pluckthresh = 400;

void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);

}

void loop() {
   for (int i = 0; i <= 12; i++) {
      
      Serial.print(analogRead(sensePin[i]));
      Serial.print(",");
     
      
   }
   Serial.println("");

}

function appSequencer(){

        $( "#console" ).html( "<h1>SEQUENCER:</h1>  Tap Phixels to produce sound" );
}


function appCalibration(){



        if(calibrating == false){

            for (var x = 0; x < columns; x++) {
                    for (var y = 0; y < rows; y++) {
                      lev.getBall(x,y).material = materialUncalibrated;
                    }
            }
            var theball = 0;
            for (theball = 0; theball < lev.balls.length; theball++) {
              var command = "C" + zeroFill(theball, 3) + zeroFill(999, 3) + zeroFill(floatto255(lev.getBallById(theball).material.color.r), 3) + zeroFill(floatto255(lev.getBallById(theball).material.color.g), 3) + zeroFill(floatto255(lev.getBallById(theball).material.color.b), 3) ;
              if(socket)
                socket.emit('ballCommand',command);
            }

            if(socket){
              socket.emit('startCallibrate', { });
            }

            calibrating = true;
            $( "#console" ).html( "<h1>CALIBRATING:</h1>  Tap the Phixel highlighted to calibrate" );

        }

        if (currentBall < lev.balls.length) {
          lev.getBallById(currentBall).material = materialSelected;
          if (currentBall == lev.balls.length-1)
            $( "#console" ).html( "<h1>CALIBRATING:</h1>  Last Phixel" );
          if(newCalID == true){
            lev.getBallById(currentBall).material = materialCalibrated;
            currentBall++;
            //SET BALL ID TO BALL
            newCalID = false;
          }
        } else {

          if(socket)
            socket.emit('endCallibrate', { });


          for (var x = 0; x < columns; x++) {
                  for (var y = 0; y < rows; y++) {
                    lev.getBall(x,y).material = materialDefault;
                  }
          }

          console.log('CALIBRATING ENDED');
          clearConsole();
          calibrating = false;
          currentBall = 0;
          appSelect = 0;

        }


}

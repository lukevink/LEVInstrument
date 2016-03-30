

function appCalibration(){
        var i = 0;
        for (var x = 0; x < columns; x++) {
                for (var y = 0; y < rows; y++) {
                  lev.getBall(x,y).material = materialUncalibrated;
                    i++;
                }
        }
        lev.getBallById(0).material = materialSelected;
        for (var b = 0; b < lev.balls.size; b++) {
          var registered = false;
          while (registered = false) {
            lev.getBallById(b).material = materialSelected;
            //listen for ball id

            serialport.on('data', function(data){
              var angle = data[0];
              lev.getBallById(b).material = materialCalibrated;
              lev.getBallById(b).userData.uniqueID = id;
              registered = true;
            });
          }
        }
}

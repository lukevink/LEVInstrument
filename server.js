var path = require('path');
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var staticRoot = path.join(__dirname+'/app/');
var serialport = require("serialport");
var SerialPort = serialport.SerialPort; // localize object constructor
var controller = new SerialPort("/dev/tty.usbmodem1421", {baudrate: 9600, parser: serialport.parsers.readline("\n")});

var isOpen = false;

controller.on("open", function () {
  isOpen=true;
});

controller.on("data", function (data) {

  //BALL TOUCHED
  if (data.substring(0, 5) == "CTRL:") {
    data = data.substring(5);
    console.log("CONTROLLER: "+data);
  }

  //CALLIBRATE ID
  if (data.substring(0, 4) == "CAL:") {
    data = data.substring(4);
    var calID = data.substring(0, 3);
    console.log("CALBRIATE--> BALLID:"+calID);

    // var angle = data[0];
    lev.getBallById(b).material = materialCalibrated;
    lev.getBallById(b).userData.uniqueID = calID;
    newCalID = true;
  }

});

//Expose static content
app.use(express.static('app'));

//Routes
app.get('/mf', function(req, res){
    res.sendFile(staticRoot+"index.html");
});

//WS Server
io.on('connection', function (socket) {

  socket.on('TurnMeOn', function (data) {
    console.log("----------- LEV SERVER STARTED -----------")
    if(isOpen)
      controller.write("H");
  });

  socket.on('ballMoved', function (data) {
    console.log(data)
  });

  // socket.on('ballY', function (data) {
  //   if(isOpen)
  //   if(data>150 & data<600){
  //     controller.write("H");
  //   } else {
  //     controller.write("L");
  //   }
  // });

  socket.on('ballCommand', function (data) {
    if(isOpen)
      controller.write(data);
      console.log(data)

  });

  socket.on('startCallibrate', function (data) {
    console.log("----------- CALLIBRATION INITIATED -----------")
    if(isOpen)
      controller.write("S1");
  });
  socket.on('endCallibrate', function (data) {
    console.log("----------- CALLIBRATION COMPLETED -----------")
    if(isOpen)
      controller.write("S0");
  });


});

server.listen(3000,function(){
    var port = server.address().port;
    var host = server.address().address;
    (host == '::') ? host = 'localhost' : host = host;
    console.log('MFS Listening at http://%s:%s',host, port);
});

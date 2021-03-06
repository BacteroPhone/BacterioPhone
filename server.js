var fs = require('fs')
,http = require('http'),
socketio = require('socket.io'),
url = require("url"), 
SerialPort = require("serialport").SerialPort

var socketServer;
var serialPort;
var portName = 'COM3'; //change this to your Arduino port
var sendData = "";

// handle contains locations to browse to (vote and poll); pathnames.
function startServer(route,handle,debug)
{
	// on request event
	function onRequest(request, response) {
	  // parse the requested url into pathname. pathname will be compared
	  // in route.js to handle (var content), if it matches the a page will 
	  // come up. Otherwise a 404 will be given. 
	  var pathname = url.parse(request.url).pathname; 
	  console.log("Request for " + pathname + " received");
	  var content = route(handle,pathname,response,request,debug);
	}
	
	var httpServer = http.createServer(onRequest).listen(1337, function(){
              console.log("Listening at: http://localhost:1337");
	      console.log("Server is up");
	}); 
	serialListener(debug);
	initSocketIO(httpServer,debug);
}

function initSocketIO(httpServer,debug)
{
	socketServer = socketio.listen(httpServer);
	if(debug == false){
		socketServer.set('log level', 1); // socket IO debug off
	}
	socketServer.on('connection', function (socket) {
	console.log("user connected");
	socket.emit('onconnection', {pollOneValue:sendData});
	socketServer.on('update', function(data) {
	socket.emit('updateData',{pollOneValue:data});
	});
	socket.on('buttonval', function(data) {
		serialPort.write(data + 'E');
	});
	socket.on('sliderval', function(data) {
                console.log("lampje:");
                console.log(data);
		serialPort.write(data + 'P');
	});
	
    });
}

function SocketIO_serialemit(sendData){
      //console.log("serial emit: ",sendData);
      var x = (new Date()).getTime(), // current time
      y = sendData;
      //socketServer.emit('updateData',{pollOneValue:sendData});
      socketServer.emit('updateData', {
        x: x,
        y: y
      });
      //console.info("emitted: [" + x + "," + y + "]");
}

// Listen to serial port
function serialListener(debug)
{
    var receivedData = "";
    serialPort = new SerialPort(portName, {
        baudrate: 9600,
        // defaults for Arduino serial communication
         dataBits: 8,
         parity: 'none',
         stopBits: 1,
         flowControl: false
    });
 
    serialPort.on("open", function () {
      console.log('open serial communication');
      // Listens to incoming data
      var cleanData = ""; // this stores the clean data
      var readData = "";  // this stores the buffer

      serialPort.on('data', function(data) {
      //console.log("serial port: " + data.toString());
      readData += data.toString(); // append data to buffer
      // if the letters "A" and "B" are found on the buffer then isolate what"s in the middle
      // as clean data. Then clear the buffer.

     if (readData.indexOf("B") >= 0 && readData.indexOf("A") >= 0) {
         cleanData = readData.substring(readData.indexOf("A") + 1, readData.indexOf("B"));
         readData = "";
         // send the incoming data to browser with websockets.
         SocketIO_serialemit(cleanData);
         }
        }
      )}
)}

exports.start = startServer;

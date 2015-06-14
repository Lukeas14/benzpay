var express = require('express');
var app = express();
var request = require('request');
var WebSocketServer = require('ws').Server;
var events = require("events");
var EventEmitter = require("events").EventEmitter;
var ee = new EventEmitter();
var serialport = require( "serialport" );
var SerialPort = serialport.SerialPort;

var vehicleUri = "http://172.31.99.4/vehicle";
var vehicleData = null;
var vehicleDataInterval = null;

app.use('/public', express.static('public'));

app.get('/', function (req, res) {
	res.send('Hello World!');
});

var server = app.listen(3000, function () {

	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);

});


setInterval(function(){
	request(vehicleUri, function(err, res, body){
		try {
			vehicleData = JSON.parse(body);
		} catch(e){
			console.log("Bad JSON");
		}
		//console.log(body);
	});
}, 500);


var wss = new WebSocketServer({ port: 3001 });
console.log("Websocket server opened at port: 3001");
wss.on('connection', function connection(ws) {
	console.log("Connection received on websocket server.");

	ws.on('message', function incoming(message) {
		console.log('received: %s', message);
	});

	//Send controls
	var sp = new SerialPort("/dev/tty.usbserial-FTGQJ7IM", {
		parser: serialport.parsers.readline( "\n" ),
		baudrate: 115200,
		databits: 8
	});
	sp.on('open', function () {
		console.log('command connect opened.');
		sp.on('data', function ( data ) {
			console.log('command message', {'command': data} );
			var command = {'command': data};

			ws.send(JSON.stringify(command));
		});
	});

	//Send vehicleData
	vehicleDataInterval = setInterval(function(){
		//console.log('wtf', JSON.stringify(vehicleData));
		try {
			ws.send(JSON.stringify(vehicleData));
		} catch(e){
			console.log('message not read');
		}
	}, 500);


	//Connection closed
	ws.on('close', function close(){
		console.log('CLOSING CONNECTION');
		clearInterval(vehicleDataInterval);
	});
});


var browserWs;

var wss = new WebSocketServer({ port: 3002 });
console.log("Websocket server opened at port: 3002");



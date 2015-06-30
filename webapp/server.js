var express = require('express');
var app = express();
var request = require('request');
var WebSocketServer = require('ws').Server;
var events = require("events");
var haversine = require('haversine');

var vehicleUri = "http://172.31.99.3/vehicle";
var vehicleData = null;
var vehicleDataInterval = null;
var vehicleDataIndex = 600; //Event
//var vehicleDataIndex = 0; //Gas
//var vehicleDataIndex = 800; //Parking
var vehicleDataJson = require('./vehicleData2.json').responses;

var points = [
	{
		id: 5,
		name: "Chevron Gas<br/>",
		logo: "Chevron Gas Logo.svg",
		price: '$34.84',
		latitude: 37.394026,
		longitude: -122.028820,
		mode: 'gas'
	},
	{
		id: 1,
		name: "Shell Gas<br/>",
		logo: "SHell.svg",
		price: '$39.75',
		latitude: 37.395347,
		longitude: -122.028327,
		mode: 'gas'
	},
	{
		id: 6,
		name: "Shell Gas<br/>",
		logo: "SHell.svg",
		price: '$46.12',
		latitude: 37.391347,
		longitude: -122.028327,
		mode: 'gas'
	},
	{
		id: 24,
		name: "49ers vs. Raiders<br/>5:05pm Levi Stadium",
		logo: "Redmarker2.svg",
		price: '$103.12',
		latitude: 37.404189,
		longitude: -121.970496,
		mode: 'events'
	},
	{
		id: 26,
		name: "The Book of Mormon<br/>7:00pm SAP Center",
		logo: "Redmarker2.svg",
		price: '$47.45',
		latitude: 37.332720,
		longitude: -121.901087,
		mode: 'events'
	},
	{
		id: 29,
		name: "WWDC<br/>All Day @ Apple Inc.",
		logo: "Redmarker2.svg",
		price: '$245.00',
		latitude: 37.331363,
		longitude: -122.029755,
		mode: 'events'
	},
	{
		id: 3,
		name: "Flat Rate Garage<br/>",
		logo: "Parking Blue.png",
		price: '$25.00',
		latitude: 37.351937,
		longitude: -121.907299,
		mode: 'parking'
	},
	{
		id: 3,
		name: "Street Parking 1hr<br/>",
		logo: "2hr Parking Logo.svg",
		price: '$1.50',
		latitude: 37.350600,
		longitude: -121.920873,
		mode: 'parking'
	},
	{
		id: 3,
		name: "Street Parking 2hr<br/>",
		logo: "2hr Parking Logo.svg",
		price: '$3.00',
		latitude: 37.344126,
		longitude: -121.912966,
		mode: 'parking'
	},
];

var serialport = require( "serialport" );

var glob = require( "glob" )

var serialPortFilenames = ( glob.sync( "/dev/tty.usbserial-*" ) ||
glob.sync( "/dev/ttyUSB*") )
if ( ! serialPortFilenames ) {
	console.log( "Serial port not found" )
	process.exit( 1 )
} else if ( serialPortFilenames.length > 2 ) {
	console.log( "You have more than one USB serial port connected!" )
	process.exit( 1 )
}
var serialPortFilename = serialPortFilenames[ 0 ]
var serialPortFilename = "/dev/tty.usbserial-FTGQEZB8"

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
	/*request(vehicleUri, function(err, res, body){
		try {
			vehicleData = JSON.parse(body);
		} catch(e){
			console.log("Bad JSON");
		}
		//console.log(body);
	});*/

	console.log(vehicleDataIndex, vehicleDataJson.length);
	if(vehicleDataIndex === vehicleDataJson.length - 5) {
		vehicleDataIndex = 0;
	}
	vehicleDataIndex++;
	vehicleData = vehicleDataJson[vehicleDataIndex];

}, 500);


var wss = new WebSocketServer({ port: 3002 });
console.log("Websocket server opened at port: 3002");
wss.on('connection', function connection(ws) {
	console.log("Connection received on websocket server.");

	var mode = 'events';

	ws.on('message', function(message){
		console.log('MESSAGE', message);
		mode = message;
	});

	//Send vehicleData
	vehicleDataInterval = setInterval(function () {

		vehicleData.points = [];

		for(point in points){

			points[point].distance = parseFloat(haversine({
				latitude: vehicleData.GPS_Latitude,
				longitude: vehicleData.GPS_Longitude
			}, points[point])).toFixed(2);
		}

		for(point in points){
			if(points[point].mode != mode) continue;
			vehicleData.points.push(points[point]);
		}
		//console.log(vehicleData);
		//console.log('wtf', JSON.stringify(vehicleData));
		try {
			ws.send(JSON.stringify(vehicleData));
		} catch (e) {
			console.log('message not read');
		}
	}, 500);


	//Connection closed
	ws.on('close', function close() {
		console.log('CLOSING CONNECTION');
		clearInterval(vehicleDataInterval);
	});
});



var wss2 = new WebSocketServer({ port: 3001 });
console.log("Websocket server opened at port: 3001");
wss2.on('connection', function connection(ws) {
	console.log("Connection received on websocket server.");

	//Send controls
	try {
		var SerialPort = serialport.SerialPort;

		var sp = new SerialPort("/dev/tty.usbserial-FTGQEZB8", {
			parser: serialport.parsers.readline("\n"),
			baudrate: 115200,
			databits: 8
		});
		sp.on('error', function(){
			console.log('comand error');
		});
		sp.on('open', function () {
			console.log('command connect opened.');
			sp.on('data', function ( data ) {
				splitData = data.split( " " )
				eventName = splitData[ 0 ]
				inArgs = {}
				for ( arg in splitData.slice( 1)[0] )  {
					splitArg = arg.split( ":" )
					if(typeof splitArg[1] !== 'undefined') {
						inArgs[splitArg[0].trim()] = splitArg[1].trim()
					}
				}

				command = null
				arg = null
				switch ( eventName.trim() ) {
					case 'touchRotate':
					case 'cceRotate':
						var change = splitData.slice(1)[0].split(':')[1];
						//change = inArgs[ 'change' ]
						if ( change < 0 ) {
							command = 'ccw'
							arg = 0 - change
						} else {
							command = 'cw'
							arg = change
						}
						break;
					case 'swipeUp':
						// this often = 2 when only one touch occurred
						arg = inArgs[ 'touches' ]
					case 'pushUpPressed':
						command = 'up'
						break;
					case 'swipeDown':
						// this often = 2 when only one touch occurred
						arg = inArgs[ 'touches' ]
					case 'pushDownPressed':
						command = 'down'
						break;
					case 'swipeLeft':
						// this often = 2 when only one touch occurred
						arg = inArgs[ 'touches' ]
						command = 'swipeleft'
						break;
					case 'pushLeftPressed':
						command = 'left'
						break;
					case 'swipeRight':
						// this often = 2 when only one touch occurred
						arg = inArgs[ 'touches' ]
						command = 'swiperight'
						break;
					case 'pushRightPressed':
						command = 'right'
						break;
					case 'touchpadAreaPressed':
					case 'selectPressed':
						command = 'click'
						break;
					case 'touchpadBackPressed':
					case 'cceBackPressed':
						command = 'back'
						break;
					case 'touchpadFavoritePressed':
					case 'cceFavoritePressed':
						command = 'favorite'
						break;
					case 'touchpadMediaPressed':
						command = 'menu'
						break;
				}
				if(command) {
					var commandWithArg = {
						'command': {
							'command': command,
							'arg': arg
						}
					};
					console.log('command message', commandWithArg);
					try {
						ws.send(JSON.stringify(commandWithArg));
					} catch(e){
						console.log('message not read');
					}
				}
			});
		});
	} catch(e){
		console.log('comand error', e);
	}

	//Connection closed
	ws.on('close', function close(){
		console.log('CLOSING CONNECTION');
	});
});

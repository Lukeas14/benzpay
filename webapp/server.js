var express = require('express');
var app = express();
var request = require('request');
var WebSocketServer = require('ws').Server;
var events = require("events");
var haversine = require('haversine');

var vehicleUri = "http://172.31.99.3/vehicle";
var vehicleData = null;
var vehicleDataInterval = null;
var vehicleDataIndex = 0;
var vehicleDataJson = require('./vehicleData.json').responses;

var points = [
	{
		id: 1,
		name: "Chevron Gas - 12 gal",
		logo: "Chevron Gas Logo.svg",
		price: '$42.12',
		latitude: 37.8074180278,
		longitude:-122.415678528
	},
	{
		id: 2,
		name: "Starbucks Order",
		logo: "Starbucks Coffee Logo.svg",
		price: '$7.45',
		latitude: 37.8074734444,
		longitude:-122.414194583
	},
	{
		id: 3,
		name: "2hr Parking",
		logo: "2hr Parking Logo.svg",
		price: '$3.00',
		latitude: 37.8077966389,
		longitude:-122.411646167
	}
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
var serialPortFilename = "/dev/tty.usbserial-FTGQJ7IM"

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

}, 100);


var wss = new WebSocketServer({ port: 3002 });
console.log("Websocket server opened at port: 3002");
wss.on('connection', function connection(ws) {
	console.log("Connection received on websocket server.");


	//Send vehicleData
	vehicleDataInterval = setInterval(function () {

		for(point in points){
			points[point].distance = parseFloat(haversine({
				latitude: vehicleData.GPS_Latitude,
				longitude: vehicleData.GPS_Longitude
			}, points[point])).toFixed(2);
		}

		vehicleData.points = points;
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

		var sp = new SerialPort("/dev/tty.usbserial-FTGQJ7IM", {
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
					case 'pushLeftPressed':
						command = 'left'
						break;
					case 'swipeRight':
						// this often = 2 when only one touch occurred
						arg = inArgs[ 'touches' ]
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
					ws.send(JSON.stringify(commandWithArg));
				}
			});
		});
	} catch(e){
		console.log('comand error', e);
	}

	//Connection closed
	ws.on('close', function close(){
		console.log('CLOSING CONNECTION');
		clearInterval(vehicleDataInterval);
	});
});

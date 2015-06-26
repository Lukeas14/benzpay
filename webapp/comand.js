var serialport = require( "serialport" )
var SerialPort = serialport.SerialPort;
var WebSocketServer = require('ws').Server;

//var sp = new SerialPort("/dev/cu.usbserial-FTWDTKXJ", {
var sp = new SerialPort("/dev/tty.usbserial-FTGQJ7IM", {
	parser: serialport.parsers.readline( "\n" ),
	baudrate: 115200,
	databits: 8
});

sp.on('open', function () {
	console.log('opeed');
	sp.on('data', function ( data ) {
		console.log( data );
	})
});
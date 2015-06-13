var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({ port: 3001 });

console.log("Websocket server opened at port: 3001");

wss.on('connection', function connection(ws) {
	console.log("Connection received on websocket server.");
	ws.on('message', function incoming(message) {
		console.log('received: %s', message);
	});

	ws.send('something');
});
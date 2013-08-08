var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server),
	port = process.env.PORT || 3000;
	

/* 
Force long polling and prevent the use of WebSockets. 
The WebSockets protocol is not yet supported on the Cedar stack.
*/
io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
});

app.configure(function() {
	app.use(express.static(__dirname + '/public'));
});

app.configure('development', function() {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function() {
  app.use(express.errorHandler());
});

app.get('/', function(req, res) {
	res.sendfile(__dirname + '/public/index.html');
});

var users = {};

io.sockets.on('connection', function(socket) {

	socket.on('sendchat', function(message) {
		// Update users conversation
		io.sockets.emit('updatechat', socket.username, message);
	});
	
	socket.on('adduser', function(username) {
		// Store the username in the socket session
		socket.username = username;
		
		// Add user to "Online Users" list
		users[username] = username;
		
		// Welcome user on connection
		socket.emit('notification', 'Welcome to Node Chat!!!');
		// Broadcast when joins the conversation
		socket.broadcast.emit('notification', username + ' joined the conversation');
		
		// Update the list of users in chat, client-side
		io.sockets.emit('updateusers', users);
	});
	
	// On user disconnect
	socket.on('disconnect', function(){
		// Remove the username from the socket session
		delete users[socket.username];
		
		// Remove user from "Online Users" list
		io.sockets.emit('updateusers', users);
		
		// Broadcast when leaves the conversation
		socket.broadcast.emit('notification', socket.username + ' left the conversation');
	});
});

server.listen(port, function() {
	console.log("Express server listening on port %d in %s mode", port, app.settings.env);
})
var app = require('express')(),
	server = require('http').createServer(app).listen(8000),
	io = require('socket.io').listen(server);
	

app.get('/', function(req, res) {
	res.sendfile(__dirname + '/index.html');
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
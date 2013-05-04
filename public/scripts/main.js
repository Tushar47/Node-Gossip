var socket = io.connect("http://localhost:8000/");

// prompt for username on connection

socket.on('connect', function(){	
	var user = prompt("What's your name?") || "Bond";
	socket.emit('adduser', user); // tell server to add user
});

// listener for new message
socket.on('updatechat', function (username, message) {
	$('#conversation').append('<b>'+username + ':</b> ' + message + '<br>');
});

// listener, for notifications
socket.on('notification', function(message) {
	$('#conversation').append('<p id="notification">' + message + '</p>');
});

// listener, online users
socket.on('updateusers', function(users) {
	$('#users').empty();
	$('#users').append('<b>Online Users</b>');
	$.each(users, function(key, value) {
		$('#users').append('<div>' + key + '</div>');
	});
});


$(function(){
	$('#data').keypress(function(e) {
		if(e.which == 13) {
			var message = $('#data').val()
			// send chat message
			if(message.length != 0) 
				socket.emit('sendchat', message);
			else
				alert("No Doughnuts for you!!, Enter a valid Text");
			$(this).val("");
		}
	});
});
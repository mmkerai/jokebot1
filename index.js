var JB = new Object();

$(document).ready(function() {
	setDefaultValues();
	$('#reviewj').submit(function(event) {
		event.preventDefault();
	});
});

function getAPIcreds() {
	console.log("Creating API credentials");
	clearMessages();
	socket.emit('getApiCredentialsRequest','');
}

function getjoke() {
	clearMessages();
	socket.emit('getJokeRequest','');
}

socket.on('getJokeResponse',function(ajoke) {
	console.log(JSON.stringify(ajoke));
	$('#message1').text(ajoke.joke);
});

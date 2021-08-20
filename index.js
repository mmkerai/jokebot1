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

var JB = new Object();

$(document).ready(function() {
	setDefaultValues();
	$('#reviewj').submit(function(event) {
		event.preventDefault();
	});
});

function regAPIcreds() {
	clearMessages();
	var an = prompt("Please enter app name: ", "");
	if(an != null && an != "") {
		var email = prompt("Please enter email: ", "");
		if(validateEmail(email)) {
			socket.emit('getApiCredentialsRequest',an,email);
		}
		else {
			$('#error').text("Invalid email");
		}
	}
	else {
		$('#error').text("You must enter a name");
	}
}

function getjoke() {
	clearMessages();
	socket.emit('getJokeRequest','');
	$('#message1').html(apistr);
}

socket.on('getJokeResponse',function(ajoke) {
	console.log(JSON.stringify(ajoke));
	$('#message1').text(ajoke.joke);
});

socket.on('getApiCredentialsResponse',function(apicreds) {
	var apistr = "<span style='font-weight:bold'>App Name: </span>"+apicreds.app_name+"<br/>" +
	"<span style='font-weight:bold'>App Id: </span>"+apicreds.app_id+"<br/>" +
	"<span style='font-weight:bold'>Api Key: </span>"+apicreds.api_key+"<br/>";
	$('#message1').html(apistr);
	$('#message2').text("These details will also be emailed to the registered email address");
});
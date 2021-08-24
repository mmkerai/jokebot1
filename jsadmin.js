var $jtable,$atable,$select;

$(document).ready(function() {
	setDefaultValues();
	checksignedin();
	$jtable = $('#btable');
	$atable = $('#abtable');
	$select = $('#select');
	$('#reviewj').submit(function(event) {
		event.preventDefault();
	});
});
 
function signInSuper() {
	var pass = prompt("Please enter the password", "");
	if(pass == null || pass == "") {
		return;
	}
	else {
		var hash = CryptoJS.SHA256(pass).toString(CryptoJS.enc.Hex);
		socket.emit('SignInSuperRequest',hash);		// password must be hased using sha256
	}
}
 
function loadjokes() {
	console.log("Loading Jokes");
	clearMessages();
	socket.emit('loadJokesRequest','');
}

function createapp() {
	console.log("Creating app credentials");
	clearMessages();
	socket.emit('loadAppRequest','');
}

function viewapps() {
	console.log("View app credentials");
	clearMessages();
	socket.emit('viewAppRequest','');
}

function showapiform() {
	clearMessages();
	$('#apiform').show();
}

function getaccesstoken() {
	console.log("Get access token");
	var app = {};
	app['appid'] = $('#appid').val();
    app['apikey'] = $('#apikey').val();
	clearMessages();
	socket.emit('getTokenRequest',app);
}

function reviewjokes() {
	console.log("Reviewing Jokes");
	clearMessages();
	socket.emit('getCatsRequest','');
//	socket.emit('getAllJokesRequest','');
}

function gettwitterfeed() {
	clearMessages();
	var twname = prompt("Please enter twitter name", "");
	if(twname == null || twname == "") {
		return;
	}
	else {
		socket.emit('getTwitterFeedRequest',twname);
	}
}

function getjokes() {
	if(!JB)
		return($('#error').text("You need to login first"));

		console.log("Getting Jokes by Category:"+$('#jcat').val());
		$("#error").text("");
		$('#qtable').show();
		socket.emit('getJokesByCatRequest',$('#jcat').val());	
}

socket.on('createAppResponse',function(obj) {
	$("#error").text("");
	$("#message1").text("App Created");
	$("#message2").text("App ID: "+obj.app_id+" API Key: "+obj.api_key);
});

socket.on('SignInSuperResponse',function(jobj) {
	JB = jobj;
	setPostLoginValues(JB);
});

socket.on('getCatsResponse',function(cats) {
	let items = Object.getOwnPropertyNames(cats);
//		let items = cats;
	console.log("Cats are: "+items);
	$('#jcat').empty();
	//First entry in dropdown
	$('#jcat').append($('<option>', {
			value: "select",
			text : "select a category"
		}));
	// subsequent entries in dropdown
	$.each(items,function(i,item) {
		$('#jcat').append($('<option>', {
		value: item,
		text : item
		}));
	});
	$('#jcat option:selected').attr('disabled','disabled');
});
	
// Bootstrap table
socket.on('getJokesResponse',function(jlist) {
	$('#jtable').show();
	$('#atable').hide();
	$jtable.bootstrapTable({data: jlist});
//	$jtable.bootstrapTable('load',{data: jlist});
});

// Bootstrap table
socket.on('viewAppResponse',function(alist) {
	$('#jtable').hide();
	$('#atable').show();
	$atable.bootstrapTable({data: alist});
});

$(function() {
    $select.click(function () {
      alert('getSelections: ' + JSON.stringify($jtable.bootstrapTable('getSelections')))
	});
});

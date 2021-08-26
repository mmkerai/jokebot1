var $jtable,$atable,$select;

$(document).ready(function() {
	setDefaultValues();
	checksignedin();
	$jtable = $('#btable');
	$atable = $('#abtable');
	$ttable = $('#attable');
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
 
function createapp() {
	console.log("Creating app credentials");
	clearMessages();
	socket.emit('getApiCredentialsRequest','');
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
//	console.log("Reviewing Jokes");
	clearMessages();
	socket.emit('getCatsRequest','');
//	socket.emit('getAllJokesRequest','');
}

function addtwitteruser() {
	clearMessages();
	var tw = prompt("Please enter twitter username", "");
	if(tw == null || tw == "") {
		return;
	}
	else {
		socket.emit('addTwitterUserRequest',tw);
	}
}

function showtwitterusers() {
	clearMessages();
	socket.emit('getTwitterUsersRequest','');
}

function getnewjokes() {
	clearMessages();
	socket.emit('getNewJokesRequest','');

}

function getjokes() {
	clearMessages();
	console.log("Getting Jokes by Category:"+$('#jcat').val());
	socket.emit('getJokesByCatRequest',$('#jcat').val());	
}

socket.on('createAppResponse',function(obj) {
	$("#message1").text("App Created");
	$("#message2").text("App ID: "+obj.app_id+" API Key: "+obj.api_key);
});

socket.on('SignInSuperResponse',function(jobj) {
	JB = jobj;
	setPostLoginValues(JB);
});

socket.on('getCatsResponse',function(cats) {
	let items = cats;
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
	$jtable.bootstrapTable({data: jlist});
//	$jtable.bootstrapTable('load',{data: jlist});
});

// Bootstrap table
socket.on('viewAppResponse',function(alist) {
	$('#atable').show();
//	console.log(alist);
	$atable.bootstrapTable({data: alist});
});

// Bootstrap table
socket.on('getTwitterUsersResponse',function(tlist) {
	$('#ttable').show();
//	console.log(tlist);
	$ttable.bootstrapTable({data: tlist});
});

$(function() {
    $select.click(function () {
      alert('getSelections: ' + JSON.stringify($jtable.bootstrapTable('getSelections')))
	});
});

// This file contains all twitter API Functions

var https = require('https');

const TwID = "3429950987";
const access_token = "AAAAAAAAAAAAAAAAAAAAAJGESwEAAAAAZtwbJwPFrf7M6pcP4Gq%2FpFVpyHA%3DJcK950uPhluGnbpjdSYxH7ylULxne0nW9JigIeUIrgFYeBK9tY";

function TwAPI() {

  }


  twitter_API_Request = function(reqpath, callBackFunction) {
	
	var options = {
		host: 'api.twitter.com',
		port: 443,
        path: reqpath,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + access_token
        }
    };
    
	var getReq = https.request(options, function (res) {
		console.log("\nstatus code: ", res.statusCode);
		var str = "";
		res.on('data', function (data) {
			str += data;
		});
		res.on('end', function () {
//            console.log("Tweet: "+ str);
			callBackFunction(str);
		});
		res.on('error', function (err) {
			console.log("API request error: ", err);
		});
	});
	//end the request
	getReq.end();
}

TwAPI.prototype.getTwitterIdFromName = function(twname, callback) {
    var retval = null;
    var path = '/2/users/by/username/' + twname;
    twitter_API_Request(path,function(response) {
        var jstr = JSON.parse(response);
        if(jstr.hasOwnProperty('data')) {
            console.log("ID is "+jstr.data.id);
            retval = jstr.data.id;
        }

        callback(retval);
    });
}

TwAPI.prototype.getTweetsFromId = function(twid, callback) {
    var path = '/2/users/' + twid + '/tweets?tweet.fields=created_at,author_id';
    twitter_API_Request(path, callback);
}

module.exports = TwAPI;

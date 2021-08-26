// This file contains all twitter API Functions

var https = require('https');

const TwID = "3429950987";
const access_token = "AAAAAAAAAAAAAAAAAAAAAJGESwEAAAAAZtwbJwPFrf7M6pcP4Gq%2FpFVpyHA%3DJcK950uPhluGnbpjdSYxH7ylULxne0nW9JigIeUIrgFYeBK9tY";

class TwUser {
    constructor(id,name,uname) {
      this.tw_id = id;
      this.tw_name = name;
      this.tw_username = uname;
      this.last_tweet_id = 0;
      this.added = new Date().toISOString();
    }
};
  
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

TwAPI.prototype.getTwitterUserFromName = function(twname, callback) {
    var retval = null;
    var path = '/2/users/by/username/' + twname;
    twitter_API_Request(path,function(response) {
        var jstr = JSON.parse(response);
        if(jstr.hasOwnProperty('data')) {
            console.log("ID is "+jstr.data.id);
            retval = new TwUser(jstr.data.id,jstr.data.name,jstr.data.username);
        }

        callback(retval);
    });
}

TwAPI.prototype.getTweetsFromUser = function(twuser, callback) {
    var path = '/2/users/' + twuser.tw_id + '/tweets?since_id='+twuser.last_tweet_id+'&tweet.fields=created_at,author_id';
    twitter_API_Request(path, callback);
}

module.exports = TwAPI;

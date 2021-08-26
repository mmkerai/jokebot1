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

// tidys up the joke text by removing hashs, @mentions and links
TwAPI.prototype.beautifyJoke = function(text) {
    var t1, match, regexp;
//    console.log("t: "+text);
    regexp = new RegExp('@([^\\s]*)','g');          // match @names
    match = text.match(regexp);
    if(match) {
        // console.log("@ matched, ignored");      // contains a reply or re-tweet so ignore
        return("ignore");                   // ignore this text, it is not a proper joke
    }
        // console.log("no match");                // ok to proceed
    regexp = new RegExp('#([^\\s]*)','g');      // match hashtags
    t1 = text.replace(regexp, '');
//    console.log("t1: "+t1);
    regexp = new RegExp('http([^\\s]*)','g');          // match http links
    t1 = t1.replace(regexp, '');
//    console.log("t2: "+t1);

    return(t1);
}

// Check if this a question and answer type of joke or not
TwAPI.prototype.getJokeType = function(text) {
    var mt, regexp;
	regexp = new RegExp('\\?([^\\s]*)','g');
	mt = text.match(regexp, '');
//	console.log("t4: "+mt);
	if(mt)
		return("Q&A")
	else
		return("Text")
}


module.exports = TwAPI;

/* 
* This is the main app to run for Jokebot API
 */
// Version 1.3 8 Jan 2022
var http = require('http');
var bodyParser = require('body-parser');
var app = require('express')();
var	server = http.createServer(app);
var crypto = require('crypto');
require('dotenv').config();

// delete these line afterwords
const fs = require('fs');
const Jfile = "alljokes.json";
const SUPERPASS = process.env.SUPERPASS;
//var	io = require('socket.io')(server);
const io = require("socket.io")(server, {
  allowRequest: (req, callback) => {
    callback(null, req.headers.origin === undefined); // cross-origin requests will not be allowed
  }
});

//const dbf = require('./JSDBfunctions.js');
const dbf = require('./DBfunctions.js');
const jbf = require('./JBfunctions.js');
const tw = require('./twitterapi.js');
const em = require('./Emailfunctions.js');
var dbt = new dbf();
var jbt = new jbf();
var twt = new tw();
var emt = new em();
var JB = new Object();
var HIGHESTJOKEID = 1234;

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

/* This does not work
io.origins(["http://localhost:3000"]); // for local development
io.origins(["https://jokebot3.appspot.com"]);
*/
//********** set the port to use
const PORT = process.env.PORT || 3000;
server.listen(PORT);
console.log("Dir path: "+__dirname);
console.log("Server started on port "+PORT);
//*****Globals *************
const SUPERADMIN = "thecodecentre@gmail.com";
const SUPERPWD = crypto.createHash('sha256').update(SUPERPASS).digest('hex');
var AUTHUSERS = new Object(); // keep list of authenticated users by their socket ids
var ActiveTokens = new Object(); // keep list of active tokens by expiry time

// Run process every 13 seconds to clear old tokens
setInterval(function() {
  const currenttime = new Date().getTime();
  Object.keys(ActiveTokens).forEach(function (token) {
//    console.log("Token: "+token+" expiry: "+ActiveTokens[token].expires);
    if(Number(currenttime) > Number(ActiveTokens[token].expires))
      delete ActiveTokens[token]; // token expired so remove from list
  });
},13000); // every 13 seconds

// Get highest joke ID. This is needed to guarantee all new jokes will
// have a unique joke ID
setTimeout(function () {
  dbt.getHighestJokeId(function(jid) {
    HIGHESTJOKEID = jid;
    console.log("Highest jid: "+HIGHESTJOKEID);
  });
},5000);

// used for initial setting up and testing
// setTimeout(function () {
//   const newapp = jbt.newAppObject();
//   dbt.saveApp(newapp, function(appid) {
//     console.log("New app created: "+newapp);
//   });

// },5000);

// URL endpoint for authentication
app.post('/apiv1/authenticate', function(req, res) {
  var appid = req.body.app_id;
  var apikey = req.body.api_key;
  console.log("app id = "+appid+", api key = "+apikey);
  jbauthenticate(appid,apikey,function(token) {
    if(token) {  // credentials correct 
      res.send(JSON.stringify(token));
    }
    else
      res.status(401).send("Authentication failed");
  });
}); 

// URL endpoint for getting jokes
app.get('/apiv1/joke', function(req, res) {
  const cat = req.query.category;
  const jid = req.query.joke_id;
  const token = req.query.access_token;
  if(token) { // make sure token in GET params
    // Validate the token i.e.
    // make sure it is in the active list and hasn't expired
    if(ActiveTokens[token]) {
      dbt.updateAppUsage(ActiveTokens[token].app_id);  // update usage stats in DB
      if(jid) { // if a joke ID is specified it overrides the category field
        dbt.getJokeById(jid,function(thejoke) {
          if(thejoke) {
            res.send(JSON.stringify(thejoke));
            dbt.updateJokeUsage(thejoke);   // update usage stats for this joke
          }
          else
            res.send('{\"error\": \"Joke ID not found\"}');
        });
      }
      else if(cat) { // category is specified
        dbt.getRandomJokeByCat(cat,function(thejoke) {
          if(thejoke) {
            res.send(JSON.stringify(thejoke));
            dbt.updateJokeUsage(thejoke);   // update usage stats for this joke
          }
          else
            res.send('{\"error\": \"Joke with category not found\"}');
        });
      }
      else { // nothing specified so get a random joke
        dbt.getRandomJoke(function(thejoke) {
          if(thejoke) {
            res.send(JSON.stringify(thejoke));
            dbt.updateJokeUsage(thejoke);   // update usage stats for this joke
          }
          else
            res.send('{\"error\": \"Joke not found\"}');
        });
      }
    }
    else {
      res.send('{\"error\": \"Access token not valid\"}');
    }
  }
  else {
    res.send('{\"error\": \"Access token missing\"}');
  }
}); 

app.get('/', (req, res) => {
  res.sendFile(__dirname + "/index.html");
});
app.get('/*.html', function(req, res){
  res.sendFile(__dirname + req.path);
}); 
app.get('/*.js', function(req, res){
  res.sendFile(__dirname + req.path);
}); 
app.get('/*.css', function(req, res){
  res.sendFile(__dirname + req.path);
}); 
app.get('/*.pdf', function(req, res){
  res.sendFile(__dirname + req.path);
}); 
/*
process.on('uncaughtException', function (err) {
  console.log('Exception: ' + err);
});
*/
// Set up socket actions and responses
io.on('connection',function(socket) {
//  console.log("Socket id: "+socket.id);
  socket.on('disconnect',function () {
//    removeSocket(socket.id,"disconnect");
  });

  socket.on('end',function() {
    removeSocket(socket.id,"end");
  });

  socket.on('connect_timeout', function() {
    removeSocket(socket.id,"timeout");
  });

  // This is for proper login
  socket.on('SignInSuperRequest',function(pwd) {
    if(!(pwd == SUPERPWD)) {  // remember that password is hashed using sha256
      console.log("pwd incorrect: "+pwd);
      return(socket.emit('infoResponse',"Incorrect Password"));
    }
    // password is correct so carry on
    AUTHUSERS[socket.id] = 31415926;
    JB['jbname'] = "JB-SuperAdmin";
    JB['jbid'] = 31415926;
    JB['jbpass'] = SUPERPWD;
    console.log("Super signed in");
    socket.emit("SignInSuperResponse",JB);
  });

  socket.on('logoutRequest',function(token) {
    AUTHUSERS[socket.id] = false;
    JB = new Object();  // delete the JB global so user needs to login again
    console.log("Logged out: "+socket.id)
    autherror(socket,"Logged out");
  });

  // request can be done by someone on landing page
  socket.on('getApiCredentialsRequest',function(appname,email) {
    var api_creds = jbt.newAppObject(appname,email);
    dbt.saveAppCredentials(api_creds);
    emt.sendRegEmail(api_creds);
    socket.emit('getApiCredentialsResponse',api_creds);
  });

  socket.on('viewAppRequest',function() {
    if(AUTHUSERS[socket.id] != JB.jbid) return(autherror(socket));
//    console.log("Viewing all apps");
    dbt.viewApps(function(obj) {
      socket.emit('viewAppResponse',obj);
    });
  });

  socket.on('getCatsRequest',function() {
    if(AUTHUSERS[socket.id] != JB.jbid) return(autherror(socket));
//    console.log("Getting categories");
    dbt.getCategories(function(cats) {
      console.log("Categories are: "+cats);
  		socket.emit('getCatsResponse',cats);
    });
  });

  socket.on('getAllJokesRequest',function() {
    if(AUTHUSERS[socket.id] != JB.jbid) return(autherror(socket));
    dbt.getAllJokes(function(jlist) {
  		socket.emit('getJokesResponse',jlist);
    });
  });

  // used by someone landing on main page - no login required
  socket.on('getJokeRequest',function() {
    dbt.getRandomJoke(function(thejoke) {
      if(thejoke) {
        socket.emit('getJokeResponse',thejoke);
        dbt.updateJokeUsage(thejoke);   // update usage stats for this joke
      }
      else
        socket.emit('errorResponse',"Joke not found");
    });
  });

  socket.on('getJokesByCatRequest',function(cat) {
    if(AUTHUSERS[socket.id] != JB.jbid) return(autherror(socket));
    if(!cat || cat == "")
      return(socket.emit('infoResponse',"Please select a category"));
    console.log("Getting Jokes of category: "+cat);
    dbt.getJokesByCat(cat,function(jlist) {
      socket.emit('getJokesResponse',jlist);
    });
  });

  socket.on('getJokeByIdRequest',function(jid) {
    if(AUTHUSERS[socket.id] != JB.jbid) return(autherror(socket));
//    console.log("Getting joke with ID: "+jid);
    dbt.getJokeById(jid,function(joke) {
      if(joke)
        socket.emit("getJokesResponse",joke);
      else
        socket.emit("errorResponse","Joke id not found");
    });
 });

  socket.on('getTokenRequest',function(app) {
    if(AUTHUSERS[socket.id] != JB.jbid) return(autherror(socket));
    jbauthenticate(app.appid,app.apikey,function(token) {
      if(token) {  // credentials correct 
        console.log("Access token: "+token.access_token);
        socket.emit("infoResponse",JSON.stringify(token));
      }
      else
        socket.emit("errorResponse","APP credentials invalid");
    });
  });

  socket.on('getTwitterUsersRequest',function() {
    if(AUTHUSERS[socket.id] != JB.jbid) return(autherror(socket));
    dbt.getAllTwitterUsers(function(users) {
      socket.emit('getTwitterUsersResponse',users);
    });
  });

  socket.on('getNewJokesRequest',function(twname) {
    if(AUTHUSERS[socket.id] != JB.jbid) return(autherror(socket));
    dbt.getAllTwitterUsers(function(users) {
      if(users == null || users == "")
        return(socket.emit("errorResponse","No twitter users"));

      users.forEach((user,index,array) => {
        if(user.tw_username.charAt(0) == '@')    // if user (not a hashtag)
          twt.getTweetTimelineFromUserID(user, function(apistr) {
            processTweet(user,apistr,socket);
          }); 
        else if(user.tw_username.charAt(0) == '#')   // must be a hashtag so search for tweets
          twt.getTweetsbySearchFromName(user, function(apistr) {
            processTweet(user,apistr,socket);
          });
        else
          console.log("User ignored: "+user.tw_username);

        // if(index == array.length - 1)    // last one in list
        //   socket.emit("getJokesResponse",Newjokes);
      });
    });
  });

  socket.on('saveJokesInDB',function(jokes) {
    if(AUTHUSERS[socket.id] != JB.jbid) return(autherror(socket));
    jokes.forEach(joke => {
      console.log("Jid: "+joke.jid);
      console.log("Name: "+joke.source);
      dbt.insertJoke(joke);
    });
    socket.emit("infoResponse",jokes.length+" new jokes added to DB");
  });
  
  // called to add new twitter user to list to follow for jokes
  // If user the name will be prefixed with @. If hastag then name will be prefixed with #
  socket.on('addTwitterUserRequest',function(twname) {
    if(AUTHUSERS[socket.id] != JB.jbid) return(autherror(socket));
    twt.getTwitterUserFromName(twname, function(twuser) {
      if(twuser == null || twuser == "")
        return(socket.emit("errorResponse","Name not found"));
      dbt.saveNewTwUser(twuser);
      socket.emit("infoResponse",twname +" user added");
    });
  });

}); //end of io.on

/*******************************************
/* Functions below this point
********************************************/
function removeSocket(id,evname) {
		console.log("Socket "+id+" "+evname+" at "+ new Date().toISOString());
    delete AUTHUSERS[id];
}

// check app id and api key match
// if they do then create a new token and add to active token list
function jbauthenticate(appid,apikey,callback) {
  dbt.authenticate(appid,apikey,function(result) {
    if(result) {  // api key is valid so create token
      const token = jbt.createToken(appid);
      ActiveTokens[token.access_token] = new Object({"app_id":appid,"expires":token.expires});
      callback(token);
    }
    else
      callback(null);
  });
}

function autherror(socket,msg) {
  if(!msg)
    msg = "Please login as admin";
  socket.emit("errorResponse",msg);
}

// load all jokes. Used once, do not use again
/* loadAllJokesFromFile = function() {
  var joke, content, jsoncontent,count=0;
 
  content = fs.readFileSync(Jfile);
  jsoncontent = JSON.parse(content);
  jsoncontent.forEach(obj => {
    joke = jbt.newJoke(HIGHESTJOKEID++,obj.Category,"Q&A","File",obj.Joke);
    dbt.insertJoke(joke);
    count++;
    });
  
  console.log(count+" Jokes Loaded");
}
 */

function processTweet(user,tweetrsp,socket) {  // response contains array of tweets
  var tweets, joke, qna, jokeobj;
  try {
    tweets = JSON.parse(tweetrsp);
    if(tweets.data) {         // make sure there are some tweeets to read
      tweets.data.forEach(tweet => {
        joke = twt.beautifyJoke(tweet.text);  // filters out #tags, @ and links
        if(joke.length > 16) {             // make sure the joke is potentially reasonable
          qna = twt.getJokeType(joke);        // check for question
          // TODO get a subject category instead of all being 'general'
          jokeobj = jbt.newJoke(HIGHESTJOKEID++,"General",qna,user.tw_username,joke);
          socket.emit("getJokesResponse",jokeobj);
        }
      });
      console.log(user.tw_username+ " newest id: "+tweets.meta.newest_id);
      dbt.updateUserLastTweet(user,tweets.meta.newest_id);
    }
    else
      console.log("No new jokes: "+user.tw_username);
  }
  catch(e) {
    console.log("JSON error: twitter timeline - " + tweetrsp);
  }
}
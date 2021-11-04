// This file contains all Mongo DB Functions
require('dotenv').config();
const {MongoClient} = require('mongodb');
const assert = require('assert');
const Jokes = "JBJokes";
const Apps = "JBApps";
const TwUsers = "TwUsers";
const DBNAME = process.env.MONGODBNAME;
const URI = process.env.MONGOURI;
var CollApps = 0;
var CollJokes = 0;
var CollTwUsers = 0;
var db;
const client = new MongoClient(URI,{useNewUrlParser: true,useUnifiedTopology: true});

// used for testing
/* async function run() {
  try {
    console.log("connecting to MongoDB");
    // Connect the client to the server
    await client.connect();
    // Establish and verify connection
    await client.db("jokebot").command({ ping: 1 });
    console.log("Connected successfully to server");
  } catch (err) {
    console.log("error: "+err.message);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

run().catch(console.dir);
 */
function DB() {
  console.log("Connecting to: "+DBNAME+" and URI: "+URI);

  client.connect(err => {
//    db = client.db(DBNAME);
    CollApps = client.db(DBNAME).collection(Apps);
    CollJokes = client.db(DBNAME).collection(Jokes);
    CollTwUsers = client.db(DBNAME).collection(TwUsers);
    console.log("DB Class initialised");
  });

}

DB.prototype.saveAppCredentials = function(appobj) {
  CollApps.insertOne(appobj,function(err, res) {
    if (err) throw err;
    console.log("1 app creds inserted:" +res.insertedId);
  });
}

DB.prototype.viewApps = function(callback) {
  CollApps.find({ }).toArray(function(err,result) {
    if (err) throw err;
    callback(result);
  });
}

// Insert a new joke (document) in the jokes collection
DB.prototype.insertJoke = function(jobj) {
  CollJokes.insertOne(jobj, function(err, res) {
    if (err) throw err;
    console.log("1 joke inserted, JID:" +jobj.jid);
  });
}

// update a joke (document) with same jid
DB.prototype.updateJoke = function(jobj,callback) {
  CollJokes.updateOne(
    {jid: Number(jobj.jid)}, 
    {$set: {
        "category" : jobj.category,
        "joke" : jobj.joke,
        "used" : jobj.used
      }
    },
    function(err, res) {
      if (err) throw err;
      console.log("joke updated:" +jobj.jid);
      callback(jobj);
  });
}

// Gets total number of jokes
DB.prototype.getNumJokes = function(callback) {
  CollJokes.countDocuments({},function(err,result) {
		if (err) throw err;
    callback(result);
  });
}

// Gets hight joke id used
DB.prototype.getHighestJokeId = function(callback) {
  CollJokes.find({ }).toArray(function(err,result) {
    if (err) throw err;
    var highest = 1;
    result.forEach(joke => {
      if(joke.jid > highest) {
        highest = joke.jid;
  //      console.log("joke id: "+joke.jid);
      }
    });
    callback(highest);
  });
}

// Clear the Jokes collection
// Used to load fresh jokes - at start only
DB.prototype.clearAllJokes = function() {
  CollJokes.deleteMany({},function(err,result) {
		if (err) throw err;
    console.log("Collection Jokes Deleted OK");
    });
}

DB.prototype.getCategories = function(callback) {
//  console.log("Getting categories");
  CollJokes.distinct("category", function(err,result) {
		if (err) console.log("No categories"); 
    callback(result);
  });
}

// Tries to get a random joke. First get total number of jokes
// then it gets all jokes in an array and indexes a random one
// Must be a better way of doing this
DB.prototype.getRandomJoke = function(callback) {
  //  console.log("Getting a random joke);
  CollJokes.countDocuments({},function(err,result) {
		if (err) throw err;
    var r = Math.floor(Math.random() * result);
    CollJokes.find({}).toArray(function(err,jokes) {
      if (err) throw err;
      callback(jokes[r]);
    });
  });
}
  
DB.prototype.getJokesByCat = function(cat,callback) {
//  console.log("Getting jokes of cat "+cat);
    CollJokes.find({category:cat}).toArray(function(err,result) {
      if (err) console.log("No jokes of cat: "+cat);
    callback(result);
  });
}

DB.prototype.getJokeById = function(id,callback) {
  console.log("Getting joke id "+id);
  CollJokes.findOne({jid:Number(id)},function(err,result) {
    if (err) throw err;
    if(!result) console.log("No joke with id: "+id);
//     console.log("Joke "+id+" details: "+JSON.stringify(result));
    callback(result);
  });
}

DB.prototype.authenticate = function(appid,apikey,callback) {
//  console.log("Auth request for app id "+appid);
  CollApps.findOne({app_id:Number(appid),api_key:apikey},function(err,result) {
    if (err) console.log("No app with id: "+appid);
    console.log("auth details: "+JSON.stringify(result));
    callback(result);
  });
}

DB.prototype.updateAppUsage = function(appid) {
  CollApps.updateOne(
    {app_id:Number(appid)},{$inc: {api_requests : 1}},function(err, res) {
      if (err) throw err;
//      console.log("Stats updated:" +res.result.nModified);
  });
}

DB.prototype.updateJokeUsage = function(joke) {
  CollJokes.updateOne(
      {_id:joke._id},{$inc: {used : 1}},function(err, res) {
        if (err) throw err;
        if (res.result)
          console.log("Stats updated:" +res.result.nModified);
    });
  }
  
// Insert a twitter user in collection
DB.prototype.saveNewTwUser = function(twuser) {
  CollTwUsers.insertOne(twuser, function(err, res) {
    if (err) throw err;
    console.log("1 user saved:" + JSON.stringify(res));
  });
}

// get a list of all twitter user in collection
DB.prototype.getAllTwitterUsers = function(callback) {
  CollTwUsers.find({ }).toArray(function(err,result) {
    if (err) throw err;
    callback(result);
  });
}


// get a list of all twitter user in collection
DB.prototype.updateUserLastTweet = function(twuser,twid) {
  var timenow = new Date().toISOString();
  CollTwUsers.updateOne(
    {tw_id:twuser.tw_id},{$set: {last_tweet_id : twid, last_search: timenow}},function(err, res) {
      if (err) throw err;
      if (res.result)
        console.log(twuser.tw_username+" updated:" +res.result.nModified);
  });
}

module.exports = DB;

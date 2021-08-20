// This file contains all JSON DB Functions
const fs = require('fs');
const Appfile = "appcredentials.json";
const Jfile = "alljokes.json";
var AppCreds;
var AllJokes;

// Load app credentials and jokes from JSON files
// Use the memory as DB
function JSDB() {

  loadAppCredentialsFromFile();
  loadAllJokesFromFile();
}

JSDB.prototype.loadAppCredentials = function() {
  loadAppCredentialsFromFile();
}

// load app credentials
loadAppCredentialsFromFile = function() {
  var content, jsoncontent;
  AppCreds = new Array();

  content = fs.readFileSync(Appfile);
  jsoncontent = JSON.parse(content);
  jsoncontent.forEach(obj => {
//  console.log("App id: "+obj.app_id);
    AppCreds.push(obj);
    });
  console.log(AppCreds.length+" App Credentials Loaded");    
}

// load all jokes
JSDB.prototype.loadAllJokes = function() {
  loadAllJokesFromFile();
}

// load all jokes
loadAllJokesFromFile = function() {
  var app, content, jsoncontent;
  AllJokes = new Array();

  content = fs.readFileSync(Jfile);
  jsoncontent = JSON.parse(content);
  jsoncontent.forEach(obj => {
//    console.log("Joke: "+obj.Joke);
      AllJokes.push(obj);
    });
  
  console.log(AllJokes.length+" Jokes Loaded");
}

JSDB.prototype.viewApps = function(callback) {
    callback(AppCreds);
}

// Gets total number of jokes
JSDB.prototype.getNumJokes = function(callback) {
  callback(AllJokes.length);
}

JSDB.prototype.getCategories = function(callback) {
  var result = new Object();
  AllJokes.forEach(obj => {
    result[obj.Category] = obj.Category;
  });
  console.log("cats: "+JSON.stringify(result));
  callback(result);
}

JSDB.prototype.getAllJokes = function(callback) {
  callback(AllJokes);
}

// Tries to get a random joke. First get total number of jokes
// then it gets all jokes in an array and indexes a random one
// Must be a better way of doing this
JSDB.prototype.getRandomJoke = function(callback) {
  var numjokes = AllJokes.length;
  var r = Math.floor(Math.random() * numjokes);
  callback(AllJokes[r]);
}

// go through each joke and return only ones of specific category
JSDB.prototype.getJokesByCat = function(cat,callback) {
  var result = [];
//  console.log("Getting jokes of cat "+cat);
  AllJokes.forEach(jobj => {
    if(jobj.Category.toLowerCase() == cat.toLowerCase())
      result.push(jobj);
  });
  callback(result); // return the list
}

// go through each joke and return a random one of specific category
JSDB.prototype.getRandomJokeByCat = function(cat,callback) {
  var result = [];
//  console.log("Getting jokes of cat "+cat);
  AllJokes.forEach(jobj => {
    if(jobj.Category.toLowerCase() == cat.toLowerCase())
      result.push(jobj);
  });
  var numjokes = result.length;   // get no of jokes with this category
  var r = Math.floor(Math.random() * numjokes);
  callback(result[r]); // send back a random one from this list
}

JSDB.prototype.getJokeById = function(id,callback) {
  let result = null;
  console.log("Getting joke id "+id);
  AllJokes.forEach(jobj => {
    if(jobj.Jid == id)
      result = jobj;
  });
  callback(result);
}

// Check if app id and corresponding apikey are in the list
// returns null if no match which should return a response of auth failure back to user
JSDB.prototype.authenticate = function(appid,apikey,callback) {
//  console.log("Auth request for app id "+appid);
  let result = null;
  AppCreds.forEach(obj => {
    if(obj.app_id == appid) {
//      console.log("App id OK");
      if(obj.api_key == apikey) {
        console.log("auth details: "+JSON.stringify(obj));
        result = true; // match found for app id and apikey
// TODO break doesnt work with forEach - change to for loop
//        break;
      }
    }
  });
  callback(result); 
}

JSDB.prototype.updateAppUsage = function(appid) {
  AppCreds.forEach(obj => {
    if(obj.app_id == appid) {
      obj.api_requests += 1;
      return;
    }
  });
}

JSDB.prototype.updateJokeUsage = function(joke) {
//        console.log("Stats updated:");
//  TODO
}

// used to add new API creds to array
JSDB.prototype.addAppCredentials = function(creds) {
//  console.log("Added new API credentials");
  AppCreds.push(creds);
}

  
module.exports = JSDB;

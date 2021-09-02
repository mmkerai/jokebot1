// This file contains all Email Functions
require('dotenv').config();
const nodemailer = require('nodemailer');
const gmailaccount = process.env.GMAILACCOUNT;
const gmailpass = process.env.GMAILPASSWORD;
var mail;
const fromemail = "Jokebot "+gmailaccount;
const emailsig = "\n\nAPI documentation can be found here: https://jokebot1.appspot.com/JokesAPI.pdf" +
                  "\n\nThe Jokebot Team";

function EM() {
  console.log("Connecting to GMAIL");
  mail = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailaccount,
      pass: gmailpass
    }
  });
}

EM.prototype.sendRegEmail = function(APIcreds) {
  var mailOptions = {
    from: fromemail,
    to: APIcreds.app_email,
    subject: 'Jokebot App Registration',
    text: "Thank you for registering your app. Your API credentials are: \n\n " + 
    "APP Name: "+APIcreds.app_name+ 
    "\nAPP ID: "+APIcreds.app_id+
    "\nAPI Key: "+APIcreds.api_key+emailsig
  };
    
  mail.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
  
}

module.exports = EM;

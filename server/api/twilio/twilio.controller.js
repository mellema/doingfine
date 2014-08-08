'use strict';

var Schedule = require('../schedule/schedule.model');
var twilio = require('twilio');
var dfTwilio = require('../../components/df.twilio/df.twilio.js');
var _ = require('lodash');
var User = require('../user/user.model');
var nodemailer = require('nodemailer');

// When twilio receives an SMS addressed to the registered DoingFine phone number, it makes a GET request to /api/twilio
// twilio can receive an twiML (xml) response with instructions (ie an SMS resonse message or phone call script)
// to update on twilio: https://www.twilio.com/user/account/phone-numbers/PN87b2b73d36ba81ded076a9e203e357eb
// previous xml request url in alpha app (nelson's pre-HR ios version): http://www.doingfineapp.com/twilio/sms-response.xml
exports.checkin = function(req, res, callback) {

  if (!callback) {
    callback = function() {};
  }

  // var senderPhone = req.query.From;
  // console.log('transporter malfunction');
  // var transporter = nodemailer.createTransport({
  //   service: 'Gmail',
  //   auth: {
  //       user: 'walkermellema@gmail.com',
  //       pass: '41tniop3'
  //   }
  // });

  // var mailOptions = {
  //   from: 'DoingFine <updates@doingfine.com>', // sender address
  //   to: 'bradme3@gmail.com',//, baz@blurdybloop.com', // list of receivers
  //   subject: 'Publisher Check-in', // Subject line
  //   text: 'I am OK', // plaintext body
  //   html: '<b>You are OK</b>' // html body
  // };

  // transporter.sendMail(mailOptions, function(error, info){
  //   if(error){
  //       console.log(error);
  //   }else{
  //       console.log('Message sent: ' + info.response);
  //   }
  // });

  var senderPhone = req.query.From;

  Schedule.find({publisherPhone: senderPhone}, function(err, schedules) {
    _.forEach(schedules, function(schedule) {
      if(schedule.subscriberCommunicationType === 'SMS'){
        dfTwilio.sendText(schedule.subscriberPhone, schedule.publisherName + ' just checked in and is doing fine. From DoingFineApp.com.');
      }
      else if(schedule.subscriberCommunicationType === 'Email'){
        //get subscriber email from user.model 
        if(typeof schedule.subscriberEmail === 'undefined'){
          User.findById(schedule.subscriberID, function (err, user) {
            if (err) console.log(err);
            if (!user){
              console.log("user not found");
            }
            else{
              schedule.subscriberEmail = user.email;
            }
          });
        }
        //send email to subscriber
        
      }
    });
    callback();
  });

};

// just an example
exports.respond = function(req, res) {

  var senderPhone = req.query.From;

  var msg = req.query.Body;
  console.log('SMS received from ' + senderPhone + ': ' + msg);

  // form a twiML response (xml) like so:
  var twiml = new twilio.TwimlResponse();
  twiml.message('Hi, from DoingFine :)');

  res.set('Content-Type', 'text/xml');
  return res.send(200, twiml.toString());
}

// Handle post to /api/twilio/twiml - do not error
exports.callPost = function(req, res) {
  console.log('post /twiml')
  // form a twiML response (xml) like so:
  var twiml = new twilio.TwimlResponse();
  twiml.say('Welcome to Twilio!');
  twiml.say('Please let us know if we can help during your development.', {
      voice:'woman',
      language:'en-gb'
  });
  res.set('Content-Type', 'text/xml');
  return res.send(200, twiml.toString());
}

function handleError(res, err) {
  return res.send(500, err);
}

/* Available from Twilio via request.query:

query:
   { ToCountry: 'US',
     ToState: 'CA',
     SmsMessageSid: 'SM717dcd406fd54735100db5800f810bb9',
     NumMedia: '0',
     ToCity: 'VENTURA',
     FromZip: '05666',
     SmsSid: 'SM717dcd406fd54735100db5800f810bb9',
     FromState: 'VT',
     SmsStatus: 'received',
     FromCity: 'MONTPELIER',
     Body: 'Dff',
     FromCountry: 'US',
     To: '+18052904005',
     ToZip: '93001',
     MessageSid: 'SM717dcd406fd54735100db5800f810bb9',
     AccountSid: 'ACcc6bd88977d0eddd1ff935ecbc2cacee',
     From: '+18027936146',
     ApiVersion: '2010-04-01' }

*/

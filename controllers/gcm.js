/**
 * Created by roche_d on 06/05/16.
 */

var config = require('../config');
var gcm = require('node-gcm');

exports.sendMessage = function(regid, msg) {

    var message = new gcm.Message();

    message.addData('message', msg);

    var regTokens = [regid];

// Set up the sender with you API key
    var sender = new gcm.Sender(config.apikey);

// Now the sender can be used to send messages
    sender.send(message, { registrationTokens: regTokens }, function (err, response) {
        if(err) console.error(err);
        else    console.log(response);
    });
};
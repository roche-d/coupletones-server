/**
 * Created by roche_d on 06/05/16.
 */

var config = require('../config');
var gcm = require('node-gcm');

exports.sendMessage = function(regid, msg) {
  // APA91bG7OGbMnGCvW7rg_kgBpqSaTiDelBBHom0tAlvgx1nSzw1DJvOvPPN3XfPyHhP7PEthNSRdbetslcaoIHSaX3mp4rTCAFVyFqXK9a_RNobc8UMER5U4D0F-p1S9HvfoDRiB-fnI

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
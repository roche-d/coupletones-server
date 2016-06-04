/**
 * Created by roche_d on 06/05/16.
 */

var config = require('../config');
var gcm = require('node-gcm');

function sendToGCM(regid, message, cb) {
    var regTokens = [regid];

// Set up the sender with you API key
    var sender = new gcm.Sender(config.apikey);

// Now the sender can be used to send messages
    sender.send(message, { registrationTokens: regTokens }, function (err, response) {
        var status = true;
        if(err) {
            console.error(err);
            status = false;
        } else    console.log(response);
        if (response && response.failure > 0) status = false;
        if (cb) cb(status);
    });
}

exports.sendMessage = function (regid, msg, cb, id) {
    var message = new gcm.Message();
    message.addData('message', msg);
    message.addData('type', 'notification');
    if (id) message.addData('ID', id);
    
    sendToGCM(regid, message, cb);
};

exports.sendPartnerRequest = function (regid, partner, cb) {
    var message = new gcm.Message();
    message.addData('message', partner);
    message.addData('type', 'partner_request');

    sendToGCM(regid, message, cb);
};

exports.sendPartnerConfirmation = function (regid, partner, cb) {
    var message = new gcm.Message();
    message.addData('message', partner);
    message.addData('type', 'partner_confirmation');

    sendToGCM(regid, message, cb);
};
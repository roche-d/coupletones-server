/**
 * Created by roche_d on 26/05/16.
 */

var mongoose =  require('mongoose');
var Schema = mongoose.Schema;

var notificationSchema = new Schema({
    From: String,
    To: String,
    LocationId: String,
    Timestamp: Date,
    Status: {type: String, enum: ['SENT', 'NSENT']}
});

module.exports = mongoose.model('Notification', notificationSchema);
/**
 * Created by roche_d on 21/05/16.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    Name: String,
    RegId: String,
    LastConnection: Date,
    Partner: String
});

module.exports = mongoose.model('User', userSchema);
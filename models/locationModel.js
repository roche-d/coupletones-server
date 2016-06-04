/**
 * Created by roche_d on 21/05/16.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var locationSchema = new Schema({
    //_id: Number,
    Name: String,
    Username: String,
    Address: String,
    Lat: String,
    Lng: String
});

module.exports.Model = mongoose.model('Location', locationSchema);
module.exports.Schema = locationSchema;
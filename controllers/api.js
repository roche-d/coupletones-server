/**
 * Main application routes
 */

var mongoose = require('mongoose');
var config = require('../config');
var gcmcontroller = require('./gcm');
var LocationModel = require('../models/locationModel');

mongoose.connect(config.database);

/* instantiate your models here

*/

exports.api = function(req, res) {
    res.json({
        message: 'coupletones-server' + ' v' + (require('../package').version),
        users: global.cache
    });
};

exports.getUserId = function(req, res) {
    console.log(req.query);
    if (req.query.username && req.query.username.length > 0) {
        if (global.cache[req.query.username]) {
            res.json({
                ID: global.cache[req.query.username],
                result: 'OK'
            });
        } else {
            res.status(404).json({
                message: 'Not Found',
                result: 'KO'
            });
        }
    } else {
        res.status(400).json({
            message: 'Invalid parameter !',
            result: 'KO'
        });
    }
};

exports.registerUser = function(req, res) {
    if (req.body.username && req.body.username.length > 0 &&
    req.body.regid && req.body.regid.length > 0) {
        global.cache[req.body.username] = req.body.regid;
        res.json({
            result: 'OK'
        });
        gcmcontroller.sendMessage(req.body.regid ,'Thanks for registering ' + req.body.username)
    } else {
        res.status(400).json({
            message: 'Invalid parameter !',
            result: 'KO'
        });
    }
};

exports.sendToUser = function(req, res) {
  if (req.body.username && req.body.username.length > 0
      && req.body.message) {
      if (global.cache[req.body.username]) {
          gcmcontroller.sendMessage(global.cache[req.body.username], req.body.message);
          res.json({
              result: 'OK'
          });
      } else {
          res.status(404).json({
              message: 'Not Found',
              result: 'KO'
          });
      }
  } else {
      res.status(400).json({
          message: 'Invalid parameter !',
          result: 'KO'
      });
  }
};

exports.updateFavoriteLocationList = function(req, res) {
    if (req.body.username && req.body.username.length > 0 && req.body.locations) {
        if (global.cache[req.body.username]) {
            try {
                LocationModel.remove({Username: req.body.username}, function(err) {
                    if (err) throw err;
                    console.log('deleted one');
                });

                (req.body.locations || []).forEach(function (e) {
                    var model = LocationModel({
                        Name: e.name,
                        Username: req.body.username,
                        Lat: e.lat,
                        Lng: e.lng
                    });

                    model.save(function (err) {
                        if (err) throw err;

                        console.log('saved');
                    });

                });
                //console.log(locations);
                res.json({
                    result: 'OK'
                });
            } catch (err) {
                res.status(500).json({
                    message: 'An error occurred',
                    result: 'KO'
                });
            }
            
        } else {
            res.status(404).json({
                message: 'User not found',
                result: 'KO'
            });
        }
    } else {
        res.status(400).json({
            message: 'Invalid parameter !',
            result: 'KO'
        });
    }
};

exports.getFavoriteLocationList = function(req, res) {
    if (req.query.username && req.query.username.length > 0) {
        LocationModel.find({Username: req.query.username}, function (err, result) {
            var result = result || [];
            res.json({
                locations: result.map(function (e) {
                    return {
                        name: e.Name,
                        lat: e.Lat,
                        lng: e.Lng
                    };
                }),
                result: 'OK'
            });
        });
    } else {
        res.status(400).json({
            message: 'Invalid parameter !',
            result: 'KO'
        });
    }
};
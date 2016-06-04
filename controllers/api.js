/**
 * Main application routes
 */

var mongoose = require('mongoose');
var config = require('../config');
var gcmcontroller = require('./gcm');
var LocationModel = require('../models/locationModel');
var UserModel = require('../models/userModel');
var NotificationModel = require('../models/notificationModel');

mongoose.connect(config.database);

/* instantiate your models here

 */

exports.api = function(req, res) {
    UserModel.find({}, function (err, users) {
        var userlist = [];
        if (users && users.length > 0) {
            userlist = users.map(function (e) {
               return {
                   'Name': e.Name,
                   'LastConnection': e.LastConnection
               };
            });
        }
        res.json({
            message: 'coupletones-server' + ' v' + (require('../package').version),
            users: userlist
        });
    });
};

exports.getUserId = function(req, res) {
    if (req.query.username && req.query.username.length > 0) {
        try {
            UserModel.findOne({Name: req.query.username}, function(err, user) {
                if (err) throw err;

                if (user) {
                    res.json({
                        ID: user.RegId,
                        result: 'OK'
                    });
                } else {
                    res.status(404).json({
                        message: 'Not Found',
                        result: 'KO'
                    });
                }
            });
        } catch (err) {
            res.status(500).json({
                message: 'An error occurred',
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
        try {
            UserModel.findOne({Name: req.body.username}, function(err, user) {
                if (err) throw err;

                if (user) {
                    user.LastConnection = new Date();
                    user.RegId = req.body.regid;
                } else {
                    var model = UserModel({
                        Name: req.body.username,
                        RegId: req.body.regid,
                        LastConnection: new Date()
                    });
                    user = model;
                    gcmcontroller.sendMessage(req.body.regid ,'Thanks for registering ' + req.body.username);
                }
                user.save(function (err) {
                    if (err) throw err;
                });
                res.json({
                    result: 'OK'
                });
            });
        } catch (err) {
            res.status(500).json({
                message: 'An error occurred',
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

exports.registerPartner = function (req, res) {
    if (req.body.username && req.body.username.length > 0 &&
        req.body.partner && req.body.partner.length > 0) {
        try {
            UserModel.findOne({Name: req.body.username}, function(err, user) {
                if (err) throw err;
                
                if (user) {
                    UserModel.findOne({Name: req.body.partner}, function(err, partner) {
                        if (err) throw err;

                        if (partner) {
                            gcmcontroller.sendPartnerConfirmation(partner.RegId, user.Name, function (ok) {
                               if (ok) {
                                   user.Partner = partner.Name;
                                   user.save();
                                   partner.Partner = user.Name;
                                   partner.save();
                                   res.json({result: 'OK'});
                               } else {
                                   res.status(500).json({
                                       message: 'Impossible to communicate with the partner !',
                                       result: 'KO'
                                   });
                               }
                            });
                        } else {
                            res.status(404).json({
                                message: 'Partner Not Found',
                                result: 'KO'
                            });
                        }
                    });
                } else {
                    res.status(404).json({
                        message: 'User Not Found',
                        result: 'KO'
                    });
                }
            });
        } catch (err) {
            res.status(500).json({
                message: 'An error occurred',
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

exports.requestPartner = function (req, res) {
    if (req.body.username && req.body.username.length > 0 &&
        req.body.partner && req.body.partner.length > 0) {
        try {
            UserModel.findOne({Name: req.body.username}, function(err, ruser) {
                if (err) throw err;

                if (ruser) {
                    UserModel.findOne({Name: req.body.partner}, function(err, user) {
                        if (err) throw err;

                        if (user) {
                            gcmcontroller.sendPartnerRequest(user.RegId, req.body.username, function (ok) {
                                if (ok) {
                                    res.json({result: 'OK'});
                                } else {
                                    res.status(500).json({
                                        message: 'Impossible to send the request to the partner !',
                                        result: 'KO'
                                    });
                                }
                            });
                        } else {
                            res.status(404).json({
                                message: 'Partner Not Found',
                                result: 'KO'
                            });
                        }
                    });
                } else {
                    res.status(404).json({
                        message: 'User Not Found',
                        result: 'KO'
                    });
                }
            });
        } catch (err) {
            res.status(500).json({
                message: 'An error occurred',
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

exports.sendToUser = function(req, res) {
    if (req.body.username && req.body.username.length > 0
        && req.body.message) {
        try {
            UserModel.findOne({Name: req.body.username}, function(err, user) {
                if (err) throw err;

                if (user) {
                    gcmcontroller.sendMessage(user.RegId, req.body.message, function (ok) {
                        var model = NotificationModel({
                            From: '',
                            To: user.Name,
                            LocationId: req.body.ID ? req.body.ID : '',
                            Timestamp: new Date(),
                            Status: ok ? 'SENT' : 'NSENT'
                        });
                        model.save(function (err) {
                            if (err) console.log(err);
                        });
                        res.json({
                            result: ok ? 'OK' : 'KO'
                        });
                    }, req.body.ID);
                } else {
                    res.status(404).json({
                        message: 'Not Found',
                        result: 'KO'
                    });
                }
            });
        } catch (err) {
            res.status(500).json({
                message: 'An error occurred',
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
        try {
            UserModel.findOne({Name: req.body.username}, function(err, user) {
                if (err) throw err;

                if (user) {
                    LocationModel.remove({Username: req.body.username}, function(err) {
                        if (err) throw err;
                        console.log('deleted one');
                    });

                    (req.body.locations || []).forEach(function (e) {
                        var model = LocationModel({
                            Name: e.name,
                            Username: req.body.username,
                            Lat: e.lat,
                            Lng: e.lng,
                            Address: e.address
                        });

                        model.save(function (err) {
                            if (err) throw err;
                        });

                    });
                    res.json({
                        result: 'OK'
                    });
                } else {
                    res.status(404).json({
                        message: 'User not found',
                        result: 'KO'
                    });
                }
            });
        } catch (err) {
            res.status(500).json({
                message: 'An error occurred',
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
                        id: e._id,
                        name: e.Name,
                        lat: e.Lat,
                        lng: e.Lng,
                        address: e.Address
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
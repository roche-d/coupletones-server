/**
 * Main application file
 */

var express = require('express');
var morgan = require('morgan');
var app = express();
var config = require('./config');
var bodyParser = require('body-parser');

global.cache = {};

// use morgan to log request to the console
app.use(morgan('dev'));
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

var controller = require('./controllers/api'); // API controller
//var routes = express.Router();

app
    .get('/apiversion', controller.api)
    .get('/partner', controller.getUserId)
    .post('/register', controller.registerUser)
    .post('/send', controller.sendToUser)
    .post('/updatelocations', controller.updateFavoriteLocationList)
    .get('/locations', controller.getFavoriteLocationList);
/* add your routes here

*/

// initialize routes with the /api prefix
//app.use('/api', routes);

// catch 404 status code
app.get('*', function(req, res){
  res.setHeader('Content-Type', 'application/json');
  res.status(404).send(JSON.stringify({ message: 'Not Found' }, 2, 2));
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json('error', {
    message: err.message,
    error: {}
  });
});

// start the server
app.listen(config.port, function() {
    console.log('Listening on port ' + config.port);
});

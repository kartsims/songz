// express basics
var express = require('express');
var path = require('path');

// my additions
var config = require('./inc/config');

var app = express();

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

app.use(express.static(path.join(__dirname, 'public')));

// make our database accessible to our router
app.use(function(req,res,next){
  var db = require('monk')(config.db.host+':'+config.db.port+'/'+config.db.database);
  req.db = db;
  next();
});

// launch the socket listener
app.use(function(req,res,next){
  var listener = require('./inc/listener');
  req.songz = listener;
  next();
});

// routes
app.use('/game', require('./routes/game'));

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;

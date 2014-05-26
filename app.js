// express basics
var express = require('express'),
  path = require('path'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser');

// my additions
var config = require('./inc/config'),
  listener = require('./inc/listener'),
  colors = require('colors');

var app = express();
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(express.static(path.join(__dirname, 'public')));

// make our database accessible to our router
app.use(function(req,res,next){
  var db = require('monk')(config.db.host+':'+config.db.port+'/'+config.db.database);
  req.db = db;
  next();
});

// pass the socket listener to Express
app.use(function(req,res,next){
  req.songz = listener;
  next();
});

// routes
app
  .use('/api', require('./routes/api'))
  .use('/admin', require('./routes/admin'));


// Use res.sendfile, as it streams instead of reading the file into memory.
app.use(function(req, res) {
  res.sendfile(__dirname + '/public/index.html');
});
/*
forget about 404
// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
*/

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

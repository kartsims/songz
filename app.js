// express basics
var express = require('express');
var path = require('path');

// my additions
// var sass = require('node-sass');
var db = require('monk')('localhost:27017/songz');

var routes = require('./routes/index');
var games = require('./routes/games');
var play = require('./routes/play');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(express.static(path.join(__dirname, 'public')));

// Make our db accessible to our router
app.use(function(req,res,next){
    req.db = db;
    next();
});

app.use('/', routes);
app.use('/games', games);
app.use('/play', play);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// sass middleware
/*
app.use(sass.middleware({
  src: __dirname + '/public/stylesheets/sass',
  dest: __dirname + '/public/stylesheets',
  debug: true,
  outputStyle: 'compressed'
}));
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

// socket connections
var io = require('socket.io').listen(3030);
io.sockets.on('connection', function (socket) {
  
  // notify everyone that a new player has entered the game
  io.sockets.emit('newPlayer', { name: socket.id });
  
  // socket.on('my other event', function (data) {
  //   console.log(data);
  // });
  
  // if socket is closed: this player leaves the game
  socket.on('disconnect', function () {
    io.sockets.emit('exitPlayer', { name: socket.id });
  });
});

module.exports = app;

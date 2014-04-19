var config = require('./config');
var io = require('socket.io').listen(config.socket.port);

/**
 * Events that happen on any socket
 */
var global_actions = {

  // new user enters a game
  connection: function(socket){

    // notify everyone that a new player has entered the game
    io.sockets.emit('new_player', { name: socket.id });

    // listen to disconnection
    socket.on('disconnect', function(){
      io.sockets.emit('exit_player', { name: socket.id });
    });

    // listen to events on this specific socket
    for(var evt in socket_actions){
      socket.on(evt, function(data){
        socket_actions[evt](socket, data);
      });
    }

  }

}
// listen to these events
for(var evt in global_actions){
  io.sockets.on(evt, global_actions[evt]);
}

/**
 * Events that happen on a specific socket
 */
var socket_actions = {

  // player sends message
  chat: function(socket, data){
    io.sockets.emit('chat', { 
      name: socket.id,
      message: data.message
    });
  }

}

/*
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
*/
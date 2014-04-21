var config = require('./config');
var io = require('socket.io').listen(config.socket.port);
var db = require('monk')(config.db.host+':'+config.db.port+'/'+config.db.database);

// this object will store information about current running games
var songz = {
  nb_online: 1,
  games: {}
};

/**
 * Events that happen on any socket
 */
var global_actions = {

  // user opens a socket
  connection: function(socket){

    songz.nb_online++;

    // notify everyone that a new player has entered the game
    // io.sockets.emit('new_player', { name: socket.id });

    // listen to disconnection
    socket.on('disconnect', function(){
      songz.nb_online--;
      // io.sockets.emit('exit_player', { name: socket.id });
    });

    // listen to events on this specific socket
    for(var evt in socket_actions){
      socket.on(evt, function(data){
        socket_actions[evt](socket, data);
      });
    }

  }

};
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
  },

  // change user's name
  set_name: function(socket, data){
    db.get('users').update(
      { _id: data._id },
      { $set: { name: data.name } },
      function(){
        io.sockets.emit('change_name', data);
      }
    );
  },

  // save profile data in database
  user_data: function(socket, data){

    // autogenerate a new name for the user
    if( typeof(data.name)=='undefined' || !data.name ){
      data.name = 'User' + Math.floor((Math.random()*98)+1);
    }

    // known user
    if( data._id ){
      db.get('users').update(
        { _id: data._id },
        { $set: data },
        function(){
          socket.emit('get_data', data);
        }
      );
    }
    // new user
    else{
      db.get('users').insert(data, function(){
        socket.emit('get_data', data);
      });
    }

  }

};


module.exports = songz
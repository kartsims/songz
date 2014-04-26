var config = require('./config');
var io = require('socket.io').listen(config.socket.port);
var db = require('monk')(config.db.host+':'+config.db.port+'/'+config.db.database);

// this object will store information about current running games
var songz = {
  nb_online: 0,
  games: {
    "53342ca9f3d7741d4b4552d9": [
      { id: 46758, nb_users: 6 }
    ]
  }
};


// user opens a socket
io.sockets.on('connection', function(socket){

  // create new user
  var user = {
    name: "Zarzouz"
  }
  socket.emit('join_game', user);

  // listen to disconnection
  // socket.on('disconnect', function(){
    // songz.nb_online--;
    // io.sockets.emit('exit_player', { name: socket.id });
  // });

  // user joins a game
  socket.on('join_game', function(data){

    socket.join(data.theme_id);
    socket.set('theme_id', data.theme_id);
    
    // notify everyone that a new player has entered the game
    io.sockets.in(socket.get('theme_id')).emit('new_player', user);

console.log('join_game');console.log(data);

    io.sockets.emit('new_player', {
      data: data
    });
  });

  // change user's name
  socket.on('change_name', function(data){

console.log('change_name');console.log(data);

    db.get('users').update(
      { _id: data._id },
      { $set: { name: data.name } },
      function(){
        io.sockets.emit('change_name', data);
      }
    );
  });

  // save profile data in database
  socket.on('user_data', function(data){

console.log('user_data');console.log(data);

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

  });

});


module.exports = songz;

var config = require('./config'),
  io = require('socket.io').listen(config.socket.port).set('log level', 1),
  db = require('monk')(config.db.host+':'+config.db.port+'/'+config.db.database),
  Game = require('./game'),
  User = require('./user'),
  debug = require('debug')('songz');

/*
  DATA SHARED WITH OTHER SCRIPTS ON THE SERVER
 */
var songz = {
  io: io,
  // all users with open socket
  users: {},
  // games currently running
  games: {}
};

/*
  OPEN A NEW SOCKET
 */
io.sockets.on('connection', function(socket){

  // store him in our application
  songz.users[socket.id] = new User(socket);
  debug("[connect]".magenta +" "+ socket.id);

  // send him his socket ID
  debug("→ socket_id".magenta +" "+ socket.id);
  socket.emit("socket_id", socket.id);
  // TODO: remove this shit!

  /*
    SOCKET DISCONNECTED
   */
  socket.on('disconnect', function(){
    debug("[disconnect]".magenta +" "+ socket.id);
    
    // user leave the current game
    var user = songz.users[socket.id];
    if (user.game_id!=null){
      songz.games[user.game_id].user_leaves(socket);
    }
    
    // update server's user info
    delete songz.users[socket.id];
  });

  /*
    JOIN A GAME
   */
  socket.on('join_game', function(data){
    debug("← join_game".magenta +" "+ socket.id);

    var game = songz.games[data.game_id],
      user = songz.users[socket.id];
    
    // check that user isn't already in another game
    if( user.game_id!=null ){
      debug("User already playing".red);
      game.user_leaves(socket);
    }

    // update server's user info
    songz.users[socket.id].game_id = game.id;

    // check that the user isn't already in this game
    if( typeof(game.players[socket.id])!='undefined' ){
      debug("User already in game !".red);
      return;
    }

    // let user join the game
    game.players[socket.id] = songz.users[socket.id];
    game.players[socket.id].score = 0;

    // console log
    console.log(user.name + " has joined the game # " + game.id.yellow);

    // preload first song
    debug("→ preload_song".magenta, game.songs[0].song_stream_url, game.id.yellow);
    socket.emit("preload_song", {
      preload: game.songs[0].song_stream_url
    });

    // join socket.io's room
    socket.join(game.id);

    // notify others of the new player
    socket.broadcast.to(game.id).emit('joined_game', {
      name: user.name
    });
    
    // update players list
    var data = game.players_list();
    debug("→ players_list".magenta, data, game.id.yellow);
    io.sockets.in(game.id).emit('players_list', data);
  });

  /*
    LEAVE A GAME
   */
  socket.on('leave_game', function(data){
    debug("← leave_game".magenta, socket.id);
    var user = songz.users[socket.id];
    if (typeof(songz.games[user.game_id])!='undefined'){
      songz.games[user.game_id].user_leaves(user);
    }
    /*
    var game = songz.games[data.game_id],
      user = songz.users[socket.id];
    game.user_leaves(user);
    */
  });

  /*
    CHANGE USER'S NAME
   */
  socket.on('change_name', function(data){
    debug("← change_name".magenta, socket.id);

    // update server's user info
    var user = songz.users[socket.id];
    var names = user.change_name(data.name);
    socket.set('name', names.new_name, function () {
      socket.emit('ready');
    });

    // if user has a game running
    if( user.game_id!=null && typeof(songz.games[user.game_id])!='undefined' ){

      // notify others of the changed name
      socket.broadcast.to(user.game_id).emit('changed_name', names);
      
      // update players list
      var data = songz.games[user.game_id].players_list();
      debug("→ players_list".magenta, data, user.game_id.yellow);
      io.sockets.in(user.game_id).emit('players_list', data);
    }

  });

  /*
    GUESSED THE ARTIST OR NAME OF THE SONG
   */
  socket.on('guessed', function(field){
    debug("← guessed".magenta, field, socket.id);
    var user = songz.users[socket.id];
    if (typeof(user)=='undefined' || typeof(songz.games[user.game_id])=='undefined'){
      return;
    }
    var game = songz.games[user.game_id],
      position = game.user_guessed(user, field);

    // send player's position if it is to be updated
    if (position!==null){
      debug("→ player_position".magenta, position, game.id.yellow);
      songz.io.sockets.in(game.id).emit("player_position", {
        socket_id: socket.id,
        position: position
      });
    }

  });

});


module.exports = songz;

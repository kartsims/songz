var config = require('./config'),
  io = require('socket.io').listen(config.socket.port).set('log level', 1)
  db = require('monk')(config.db.host+':'+config.db.port+'/'+config.db.database)
  Games = require('./games')
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
  songz.users[socket.id] = {
    game_id: null,
    name: "Anonymous"
  };
  debug("[connect]".magenta +" "+ socket.id);

  // send him his socket ID
  debug("→ socket_id".magenta +" "+ socket.id);
  socket.emit("socket_id", socket.id);

  /*
    SOCKET DISCONNECTED
   */
  socket.on('disconnect', function(){
    debug("[disconnect]".magenta +" "+ socket.id);
    
    // user leave the current game
    Games.user_leaves_game(songz, socket);
    
    // update server's user info
    delete songz.users[socket.id];
  });

  /*
    JOIN A GAME
   */
  socket.on('join_game', function(data){
    debug("← join_game".magenta +" "+ socket.id);

    var game_id = data.game_id;
    
    // check that user isn't already in another game
    if( songz.users[socket.id].game_id!=null ){
      debug("User already playing".red);
      Games.user_leaves_game(songz, socket);
    }

    // update server's user info
    songz.users[socket.id].game_id = game_id;

    // check that the user isn't already in this game
    if( typeof(songz.games[game_id].players[socket.id])!='undefined' ){
      debug("User already in game !".red);
      return;
    }

    // let user join the game
    songz.games[game_id].players[socket.id] = songz.users[socket.id];
    songz.games[game_id].players[socket.id].score = 0;

    // console log
    console.log(songz.users[socket.id].name + " has joined the game # " + game_id.yellow);

    // preload first song
    debug("→ preload_song".magenta, songz.games[game_id].songs[0].song_stream_url, game_id.yellow);
    socket.emit("preload_song", {
      preload: songz.games[game_id].songs[0].song_stream_url
    });

    // join socket.io's room
    socket.join(game_id);

    // notify others of the new player
    socket.broadcast.to(game_id).emit('joined_game', {
      name: songz.users[socket.id].name
    });
    
    // update players list
    var data = Games.players_list(songz, game_id);
    debug("→ players_list".magenta, data, game_id.yellow);
    io.sockets.in(game_id).emit('players_list', data);
  });

  /*
    LEAVE A GAME
   */
  socket.on('leave_game', function(data){
    debug("← leave_game".magenta, socket.id);
    Games.user_leaves_game(songz, socket);
  });

  /*
    CHANGE USER'S NAME
   */
  socket.on('change_name', function(data){
    debug("← change_name".magenta, socket.id);

    // update server's user info
    var old_name = songz.users[socket.id].name;
    songz.users[socket.id].name = data.name;
    socket.set('name', data.name, function () {
      socket.emit('ready');
    });

    // if user has a game running
    if( songz.users[socket.id].game_id!=null ){

      // notify others of the changed name
      socket.broadcast.to(songz.users[socket.id].game_id).emit('changed_name', {
        old_name: old_name,
        new_name: data.name
      });
      
      // update players list
      var data = Games.players_list(songz, songz.users[socket.id].game_id);
      debug("→ players_list".magenta, data, songz.users[socket.id].game_id.yellow);
      io.sockets.in(songz.users[socket.id].game_id).emit('players_list', data);
    }

  });

  /*
    GUESSED THE ARTIST OR NAME OF THE SONG
   */
  socket.on('guessed', function(field){
    debug("← guessed".magenta, field, socket.id);
    Games.user_guessed(songz, socket, field);
  });

});


module.exports = songz;

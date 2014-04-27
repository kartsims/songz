var config = require('./config'),
  io = require('socket.io').listen(config.socket.port).set('log level', 1)
  db = require('monk')(config.db.host+':'+config.db.port+'/'+config.db.database)
  Games = require('./games');

/*
  DATA SHARED WITH OTHER SCRIPTS ON THE SERVER
 */
var songz = {
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
  console.log("[connect]".magenta + " socket # " + socket.id.cyan);

  /*
    SOCKET DISCONNECTED
   */
  socket.on('disconnect', function(){
    console.log("[disconnect]".magenta + " socket # " + socket.id.cyan);
    
    // user leave the current game
    Games.user_leaves_game(songz, socket.id);
    
    // update server's user info
    delete songz.users[socket.id];
  });

  /*
    JOIN A GAME
   */
  socket.on('join_game', function(data){
    console.log("[on]".magenta + " join_game socket # " + socket.id.cyan);

    var game_id = data.game_id;

    // update server's user info
    songz.users[socket.id].game_id = game_id;

    // let user join the game
    songz.games[game_id].players.push(socket.id);

    // console log
    console.log(songz.users[socket.id].name + " has joined the game # "+game_id);

    // notify other players
    var data = Games.players_list(songz, game_id);
    console.log("[emit]".magenta + " players_list", data);
    io.sockets.emit('players_list', data);
  });

  /*
    LEAVE A GAME
   */
  socket.on('leave_game', function(data){
    console.log("[on]".magenta + " leave_game socket # " + socket.id.cyan);

    Games.user_leaves_game(songz, socket.id);
  });

  /*
    CHANGE USER'S NAME
   */
  socket.on('change_name', function(data){

    // update server's user info
    songz.users[socket.id].name = data.name;

    // notify other players if this user is not playing currently
    if( songz.users[socket.id].game_id!=null ){
      console.log("[emit]".magenta + " players_list");
      console.log( Games.players_list(songz, songz.users[socket.id].game_id) );
      io.sockets.emit('players_list', Games.players_list(songz, songz.users[socket.id].game_id));
    }

  });

});


module.exports = songz;

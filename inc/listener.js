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
  console.log("[connect]".magenta +" "+ socket.id.cyan);

  /*
    SOCKET DISCONNECTED
   */
  socket.on('disconnect', function(){
    console.log("[disconnect]".magenta +" "+ socket.id.cyan);
    
    // user leave the current game
    Games.user_leaves_game(songz, io, socket);
    
    // update server's user info
    delete songz.users[socket.id];
  });

  /*
    JOIN A GAME
   */
  socket.on('join_game', function(data){
    console.log("← join_game".magenta +" "+ socket.id.cyan);


    var game_id = data.game_id;

    // update server's user info
    songz.users[socket.id].game_id = game_id;

    // check that the user isn't already in this game
    // TODO
    // check that user isn't already in another game
    // TODO

    // let user join the game
    songz.games[game_id].players.push(socket.id);

    // console log
    console.log(songz.users[socket.id].name + " has joined the game # "+game_id);

    // join socket.io's room
    socket.join(game_id);

    // notify others of the new player
    socket.broadcast.to(game_id).emit('joined_game', {
      name: songz.users[socket.id].name
    });
    
    // update players list
    var data = Games.players_list(songz, game_id);
    console.log("→ players_list".magenta, data, game_id);
    io.sockets.in(game_id).emit('players_list', data);
  });

  /*
    LEAVE A GAME
   */
  socket.on('leave_game', function(data){
    console.log("← leave_game".magenta +" "+ socket.id.cyan);
    Games.user_leaves_game(songz, io, socket);
  });

  /*
    CHANGE USER'S NAME
   */
  socket.on('change_name', function(data){
    console.log("← change_name".magenta +" "+ socket.id.cyan);

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
      console.log("→ players_list".magenta, data, songz.users[socket.id].game_id);
      io.sockets.in(songz.users[socket.id].game_id).emit('players_list', data);
    }

  });

});


module.exports = songz;

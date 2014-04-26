var config = require('./config'),
  io = require('socket.io').listen(config.socket.port);

module.exports = {

  /*
    FORMAT PLAYERS LIST FOR FRONT VIEW
   */
  players_list: function(songz, game_id){

    var game_data = songz.games[game_id],
      players = [];

    for(var key in game_data.players){
      var socket_id = game_data.players[key];
      // if player doesn't exist anymore, remove it
      if( typeof(songz.users[socket_id])=='undefined' ){
        delete songz.games[game_id].players[key];
      }
      // add to players list
      else {
        players.push({
          id: socket_id,
          name: songz.users[socket_id].name
        });
      }
    }

    return players;
  },

  /*
    A USER LEAVES THE GAME
   */
  user_leaves_game: function(songz, socket_id){

    var game_id = songz.users[socket_id].game_id;

    // update server's user info
    songz.users[socket_id].game_id = null;

    // remove user from the game
    for(var key in songz.games[game_id].players){
      if( songz.games[game_id].players[key]==socket_id ){
        delete songz.games[game_id].players[key];
      }
    }

    // remove game if everyone is gone !
    // 
    // TODO
    // 
    
    // console log
    console.log(songz.users[socket_id].name + " has left the game # "+game_id);

    // notify other players
    var data = this.players_list(songz, game_id);
    console.log("[emit] players_list", data);
    io.sockets.emit('players_list', data);
  }

}
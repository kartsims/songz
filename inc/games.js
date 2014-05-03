var config = require('./config'),
  db = require('monk')(config.db.host+':'+config.db.port+'/'+config.db.database);;

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
        songz.games[game_id].players.splice(key, 1);
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
    FIND A GAME FROM A THEME
   */
  find_by_theme: function(songz, theme_id){

    var game_id = null;

    // is there a game currently running on this theme ?
    for(var id in songz.games){

      if(
        songz.games[id].theme_id == theme_id &&
        songz.games[id].players.length < config.game.max_players
      ){
        game_id = id;
        console.log("New player can join game # "+game_id);
        break;
      }

    }
    // create a new game on this theme
    if( game_id === null ){
      var game_id = this.create_game(songz, theme_id);
      console.log("New player created game # "+game_id);
      this.start_game(songz, game_id);
    }

    return game_id;

  },

  /*
    CREATE A NEW GAME
   */
  create_game: function(songz, theme_id){
      var game_id = theme_id + '-' + Date.now();
      songz.games[game_id] = {
          theme_id: theme_id,
          players: [],
          songs: [],
          results: []
      };

      // pick X songs
      db.get('themes').findById(theme_id, function (err, docs){
        while( songz.games[game_id].songs.length < config.game.nb_songs ){
          var i = Math.floor( docs.theme_songs.length * Math.random() );
          var song = docs.theme_songs.splice(i, 1)[0];
          song.results = {
            name: [],
            artist: []
          }
          songz.games[game_id].songs.push( song );
        }
      });

      return game_id;
  },

  /*
    START A GAME
   */
  start_game: function(songz, game_id){
    var Games = this;

    // start playing in X seconds
    setTimeout(function(){
      Games.play_next_song(songz, game_id);
    }, config.game.start_timer*1000);

  },

  /*
    PLAY NEXT SONG
   */
  play_next_song: function(songz, game_id){
    var Games = this;

    // if no more song, end the game
    if( songz.games[game_id].songs.length==0 ){
      Games.finish(songz, game_id);
      return;
    }

    // start playing next song
    var song = songz.games[game_id].songs[0];
    var data = {
      // TODO: encode song's artist and name
      artist: song.song_artist_encode,
      name: song.song_name_encode,
      // 
      play: song.song_stream_url,
      duration: config.game.song_duration
    }
    console.log("→ play_song".magenta, song.song_artist+" - "+song.song_name, game_id.yellow);
    songz.io.sockets.in(game_id).emit("play_song", data);

    // send results at the end of the song
    setTimeout(function(){
      var result = songz.games[game_id].songs.shift();
      songz.games[game_id].results.push(result);
      console.log("→ answer_song".magenta, song.song_artist+" - "+song.song_name, game_id.yellow);
      songz.io.sockets.in(game_id).emit("answer_song", result);
      
      // then play next song in X seconds
      setTimeout(function(){
        Games.play_next_song(songz, game_id);
      }, config.game.interval_timer*1000);
      
    }, config.game.song_duration*1000 + 1000);
    

  },

  /*
    GAME IS FINISHED
   */
  finish: function(songz, game_id){

    // notify every player of the result
    console.log("→ game_results".magenta, new String("game_id").yellow);
    songz.io.sockets.in(game_id).emit("game_results", songz.games[game_id].results);
    
    // remove from global object
    delete songz.games[game_id];
  },

  /*
    A USER LEAVES THE GAME
   */
  user_leaves_game: function(songz, socket){

    var io = songz.io;
    var game_id = songz.users[socket.id].game_id;

    // update server's user info
    songz.users[socket.id].game_id = null;

    // game doesn't exist ?
    if( typeof(songz.games[game_id])=='undefined' ){
      return;
    }

    // remove user from the game
    for(var key in songz.games[game_id].players){
      if( songz.games[game_id].players[key]==socket.id ){
        songz.games[game_id].players.splice(key, 1);
      }
    }
    
    // console log
    console.log(songz.users[socket.id].name + " has left the game # "+game_id);

    // notify other players
    console.log("→ left_game".magenta, songz.users[socket.id].name, game_id.yellow);
    socket.broadcast.to(game_id).emit('left_game', {
      name: songz.users[socket.id].name
    });

    // update other players' list
    var data = this.players_list(songz, game_id);
    console.log("→ players_list".magenta, data, game_id.yellow);
    socket.broadcast.to(game_id).emit('players_list', data);

    // leave socket.io's room
    socket.leave(game_id);

    // remove game if everyone is gone !
    if( songz.games[game_id].players.length==0 ){
      this.finish(songz, game_id);
    }
  },

  /*
    USER HAS GUESSED THE NAME OR ARTIST
   */
  user_guessed: function(songz, socket, field){

    var game_id = songz.users[socket.id].game_id;

    // add this user to the results
    songz.games[game_id].songs[0].results[field].push(socket.id);
  }

}
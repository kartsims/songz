var config = require('./config'),
  db = require('monk')(config.db.host+':'+config.db.port+'/'+config.db.database),
  debug = require('debug')('songz');


var Game = function(songz, theme_id){

  this.id = theme_id + '-' + Date.now();
  this.theme_id = theme_id;
  this.players = {};
  this.songs = [];
  this.results = [];
  this.players_positions = [];
  this.songz = songz;
  this.started_at = Date.now();

  // pick X songs
  var x = this;
  db.get('themes').findById(theme_id, function (err, docs){
    while( x.songs.length < config.game.nb_songs ){
      var i = Math.floor( docs.theme_songs.length * Math.random() );
      var song = docs.theme_songs.splice(i, 1)[0];
      song.results = {
        name: [],
        artist: []
      }
      x.songs.push( song );
    }
  });

  // add to collection
  songz.games[this.id] = this;
}



/************************************************
              INSTANCE METHODS
************************************************/


/*
  FORMAT PLAYERS LIST FOR FRONT VIEW
 */
Game.prototype.players_list = function(){
  var players = {};
  for(var i in this.players){
    players[i] = {
      name: this.players[i].name,
      position: this.players[i].position,
      score: this.players[i].score
    };
  }
  return players;
};

/*
  START A GAME
 */
Game.prototype.begin = function(){
  var x = this;
  // start playing in X seconds
  setTimeout(function(){
    x.play_next_song();
  }, config.game.start_timer*1000);

};

/*
  PLAY NEXT SONG
 */
Game.prototype.play_next_song = function(){
  var x = this;

  // if no more song, end the game
  if( this.songs.length==0 ){
    this.finish();
    return;
  }

  // reset players' positions for this round
  this.players_positions = [];

  // start playing next song
  var song = this.songs[0];
  var data = {
    // TODO: encode song's artist and name
    artist: song.song_artist_encode,
    name: song.song_name_encode,
    // 
    play: song.song_stream_url,
    duration: config.game.song_duration,
    players: this.players_list(),
    nb_songs_left: this.songs.length,
    nb_songs_total: config.game.nb_songs
  };
  debug("→ play_song".magenta, song.song_artist+" - "+song.song_name, this.id.yellow);
  this.songz.io.sockets.in(this.id).emit("play_song", data);

  // send results at the end of the song
  setTimeout(function(){
    var result = x.songs.shift();
    x.results.push(result);
    debug("→ answer_song".magenta, song.song_artist+" - "+song.song_name, x.id.yellow);
    x.songz.io.sockets.in(x.id).emit("answer_song", result);
    
    // then play next song in X seconds
    setTimeout(function(){
      x.play_next_song();
    }, config.game.interval_timer*1000);
    
  }, config.game.song_duration*1000 + 1000);

};


/*
  GAME IS FINISHED
 */
Game.prototype.finish = function(){

  // notify every player of the result
  debug("→ game_finished".magenta, this.id.yellow);
  this.songz.io.sockets.in(this.id).emit("game_finished", this.id);

  // save results to database
  var players = this.players_list(),
    db_record = {
      _id: this.id,
      theme_id: this.theme_id,
      started_at: this.started_at,
      finished_at: Date.now(),
      players: []
    };
  for (var id in players) {
    db_record.players.push({
      'name': players[id].name,
      'score': players[id].score
    });
  }
  db.get('results').insert(db_record);

  // console log
  console.log("Game finished", this.id.yellow);
  
  // remove from global object
  delete this.songz.games[this.id];
  // TODO: test this !
};

/*
  A USER LEAVES THE GAME
 */
Game.prototype.user_leaves = function(user){

  // remove user from the game
  delete this.players[user.id];
  
  // remove game if everyone is gone !
  if( this.players.length==0 ){
    this.finish();
  }

};

/*
  USER HAS GUESSED THE NAME OR ARTIST
 */
Game.prototype.user_guessed = function(user, field){

  // update user's score
  this.players[user.id].score++;

  // save position
  if (this.players_positions.indexOf(user.id)==-1){
    this.players_positions.push(user.id);
    var position = this.players_positions.length;

    return position;
  }

  // user has already guessed, so no position update
  return null;
}



/************************************************
              STATIC METHODS
************************************************/


/*
  FIND A GAME FROM A THEME
 */
Game.find_by_theme = function(songz, theme_id){

  // is there a game currently running on this theme ?
  for(var i in songz.games){

    if(
      songz.games[i].theme_id == theme_id &&
      Object.keys(songz.games[i].players).length < config.game.max_players
    ){
      var game = songz.games[i];
      debug("New player can join game # " + game.id.yellow);
      break;
    }

  }
  // create a new game on this theme
  if( typeof(game) == "undefined" ){
    var game = new Game(songz, theme_id);
    console.log("New player created game # " + game.id.yellow);
    game.begin();
  }

  return game.id;

};

module.exports = Game;
var express = require('express'),
  router = express.Router(),
  config = require('../inc/config'),
  songz = require('../inc/listener'),
  Games = require('../inc/games');


/*
  HOMEPAGE
 */
router.get('/home', function(req, res) {
  req.db.get('themes').find({}, function (err, docs){
    res.send({
      nb_online: Object.keys(songz.users).length,
      themes: docs
    });
  });
});

/*
  SEARCHING FOR A GAME TO JOIN
 */
router.get('/join/:theme_id', function(req, res) {
  console.log("New player wants to join theme # "+theme_id);

  var theme_id = req.params.theme_id,
    game_id = null;
  
  // is there a game currently running on this theme ?
  for(var id in songz.games){

    if(
      songz.games[id].theme_id == theme_id &&
      songz.games[id].players.length < config.game.max_players
    ){
      game_id = id;
      console.log("New player joins game # "+game_id);
      break;
    }

  }
  // create a new game on this theme
  if( game_id === null ){

    game_id = theme_id + '-' + Date.now();

    console.log("New player creates game # "+game_id);

    songz.games[game_id] = {
        theme_id: theme_id,
        players: [],
        songs: []
    };

  }

  res.send({game_id: game_id});
});


/*
  PLAY THE GAME
 */
router.get('/game/:id', function(req, res) {
  var game_id = req.params.id;

  // game doesn't exist, find a new one on this theme
  if( typeof(songz.games[game_id])=='undefined' ){

    // TODO
    // > redirect to the right place
    
    // send object containing the good game_id

  }
  else {
    // send empty object
    res.send([]);
  }
  
});


module.exports = router;

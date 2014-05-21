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
  var theme_id = req.params.theme_id;
  console.log("New player wants to join theme # "+theme_id);

  // look for a game in this theme
  var game_id = Games.find_by_theme(songz, theme_id);
  
  res.send({game_id: game_id});
});


/*
  PLAY THE GAME
 */
router.get('/game/:id', function(req, res) {
  var game_id = req.params.id;

  // game doesn't exist, find a new one on this theme
  if( typeof(songz.games[game_id])=='undefined' ){

    var theme_id = game_id.split('-')[0];
  
    // look for another game in this theme
    var game_id = Games.find_by_theme(songz, theme_id);

    // send object containing the good game_id
    res.send({game_id:game_id});
  }
  else {
    // send empty object
    res.send({});
  }
  
});


/*
  GAME RESULTS
 */
router.get('/results/:id', function(req, res) {
  var game_id = req.params.id;

  req.db.get('results').findById(game_id, function (err, results){
    req.db.get('themes').findById(results.theme_id, function (err, theme){
      res.send({
        theme: theme,
        results: results
      });
    });
  });
  
});


module.exports = router;

var express = require('express');
var router = express.Router();

// list of themes
router.get('/themes', function(req, res) {
  req.db.get('themes').find({}, function (err, docs){
    res.send({
      template: 'home',
      nb_online: req.songz.nb_online,
      // songz: req.songz.current_games,
      themes: docs
    });
  });
});

// theme information and list of current games
router.get('/theme/:id', function(req, res) {
  req.db.get('themes').findOne({
    _id: req.params.id
  }, function (err, docs){
    res.send({
      template: 'theme',
      theme: docs
    });
  });
});

// results of a game
router.get('/results/:id', function(req, res) {
});

// game current state
router.get('/:id', function(req, res) {
});

/*
router.get('/:slug?', function(req, res) {

  req.db.get('themes').findOne({
    slug: req.params.slug
  }, function (err, docs){
    res.render('games', {theme: docs});
  });
  
});
*/
module.exports = router;

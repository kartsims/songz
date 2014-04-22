var express = require('express');
var router = express.Router();


/*
  HOMEPAGE
 */
router.get('/home', function(req, res) {
  req.db.get('themes').find({}, function (err, docs){
    res.send({
      nb_online: req.songz.nb_online,
      themes: docs
    });
  });
});

/*
  THEME DETAILS
 */
router.get('/theme/:id', function(req, res) {
  req.db.get('themes').findOne({
    _id: req.params.id
  }, function (err, theme){
    res.send({
      // games: req.songz.games[theme._id],
      theme: theme
    });
  });
});

/*
  PLAY THE GAME
 */
router.get('/play/:id', function(req, res) {
  req.db.get('themes').findOne({
    _id: req.params.id
  }, function (err, theme){
    res.send({
      // games: req.songz.games[theme._id],
      theme: theme
    });
  });
});


module.exports = router;

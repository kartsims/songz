var express = require('express');
var router = express.Router();


/*
  LOAD APPLICATION: INIT USER SESSION
 */
router.get('/', function(req, res) {
console.log('LOAD APP');
  // new user session
  if( typeof(req.cookies.user_id)=='undefined' ){
    var user = {};
    req.db.get('users').insert(user, function (){
console.log('new user ID : '+user._id);
      res.cookie('user_id', user._id);
      res.send({
        user_id: user._id
      });
    });
  }
  // known user
  else{
console.log('known user # '+req.cookies.user_id);
    req.db.get('users').findOne({
      _id: req.cookies.user_id
    }, function (err, user){
      /*
      if(!user){
        throw "User not recognized";
      }
      */
      if(user){
console.log('user found in database # '+user._id);
        res.send({
          user_id: user._id
        });
      }
      // create new user
      else{
console.log('user NOT found in database # '+user._id);
        // TODO: this duplicates above code, go DRY !
        var user = {};
        req.db.get('users').insert(user, function (){
console.log('new user ID : '+user._id);
          res.cookie('user_id', user._id);
          res.send({
            user_id: user._id
          });
        });
      }
    });
  }
});

/*
  HOMEPAGE
 */
router.get('/home', function(req, res) {
  req.db.get('themes').find({}, function (err, docs){
    res.send({
      template: 'home',
      nb_online: req.songz.nb_online,
      themes: docs
    });
  });
});

/*
  THEME PAGE
 */
router.get('/theme/:id', function(req, res) {
  req.db.get('themes').findOne({
    _id: req.params.id
  }, function (err, theme){
    res.send({
      template: 'theme',
      games: req.songz.games[theme._id],
      theme: theme
    });
  });
});

// results of a game
router.get('/results/:id', function(req, res) {
});

// game current state
router.get('/play/:id', function(req, res) {
});

module.exports = router;

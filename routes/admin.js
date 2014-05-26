var express = require('express'),
  router = express.Router();


/*
  DASHBOARD
 */
router.get('/', function(req, res) {

  var format_result = function(themes){

    var result = {
      games: [],
      users: [],
      themes: {}
    };

    // themes
    var themes_obj = {};
    for (var i in themes){
      var t = themes[i];
      result.themes[t._id] = {
        name: t.name,
        nb_games: 0
      };
    }

    // games
    for (var i in req.songz.games){
      var g = req.songz.games[i];
      result.games.push({
        id: g.id,
        started_at: g.started_at,
        theme_id: g.theme_id,
        nb_players: Object.keys(g.players).length,
        nb_songs_left: Object.keys(g.songs).length
      });
      result.themes[g.theme_id].nb_games++;
    }

    // users
    for (var i in req.songz.users){
      var g = req.songz.users[i];
      result.users.push({
        id: g.id,
        name: g.name
      });
    }

console.log(result);

    return result;
  }


  req.db.get('themes').find({}, function (err, docs){
    res.render('admin/dashboard', format_result(docs));
  });
});


module.exports = router;

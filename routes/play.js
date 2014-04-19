var express = require('express');
var router = express.Router();

// show game page
router.get('/', function(req, res) {
  res.render('play');
});

// AJAX call for current game data
router.get('/data', function(req, res) {
  data = {
    here: "let's put some info about the current game to set up the page"
  }
  res.send(data);
});

module.exports = router;

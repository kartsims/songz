var express = require('express');
var router = express.Router();

/* GET games listing. */
router.get('/', function(req, res) {
  res.render('play');
});

module.exports = router;

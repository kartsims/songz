var express = require('express');
var router = express.Router();

/* Themes listing */
router.get('/', function(req, res) {
  
  var themesDB = req.db.get('themes');
  
  themesDB.find({}, function (err, docs){
    // res.send(docs);
    res.render('index', {themes: docs});
  });
  
});

module.exports = router;

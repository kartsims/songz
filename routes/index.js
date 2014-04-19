var express = require('express');
var router = express.Router();

/* Themes listing */
router.get('/', function(req, res) {
  
  req.db.get('themes').find({}, function (err, docs){
    // res.send(docs);
    res.render('index', {themes: docs});
  });
  
});

module.exports = router;

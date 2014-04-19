var express = require('express');
var router = express.Router();

/* GET games listing. */
router.get('/:slug?', function(req, res) {

  req.db.get('themes').findOne({
    slug: req.params.slug
  }, function (err, docs){
    res.render('games', {theme: docs});
  });
  
});

module.exports = router;

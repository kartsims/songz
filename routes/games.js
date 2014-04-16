var express = require('express');
var router = express.Router();

/* GET games listing. */
router.get('/:slug?', function(req, res) {
  res.render('games', {themeSlug: req.params.slug});
});

module.exports = router;

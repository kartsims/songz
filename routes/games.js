var express = require('express');
var router = express.Router();

/* GET games listing. */
router.get('/:id_package?', function(req, res) {

  res.render('games', {theme: req.params.id_package});
});

module.exports = router;

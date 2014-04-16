var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  
  // thèmes en dur, à extraire de la BDD
  themes = [
    {slug: 'country', name: 'Country'},
    {slug: 'hip-hop', name: 'Hip Hop'},
    {slug: 'Pop', name: 'Pop'}
  ];
  
  res.render('index', {themes: themes});
});

module.exports = router;


var config = require('./inc/config');
var db = require('monk')(config.db.host+':'+config.db.port+'/'+config.db.database);

/**
 * MISE A JOUR DES THEMES
 */
var update_themes = {
  '53342101f3d774214b4552d7': {
    name: 'Top 500',
    slug: 'top-500',
  },
  '53342101f3d774214b4552d8': {
    name: 'Rock',
    slug: 'rock',
  },
  '53342101f3d774214b4552d9': {
    name: 'Pop',
    slug: 'pop',
  },
  '53342101f3d774214b4552da': {
    name: 'Rap & Hip Hop',
    slug: 'rap-hip-hop',
  },
  '53342101f3d774214b4552db': {
    name: 'Rap FR',
    slug: 'rap-fr',
  },
  '53342101f3d774214b4552dc': {
    name: 'Métal / Hard',
    slug: 'metal-hard',
  },
  '53342101f3d774214b4552dd': {
    name: 'R&B',
    slug: 'rnb',
  },
  '53342101f3d774214b4552de': {
    name: 'Années 2000',
    slug: 'annees-2000',
  },
  '53342101f3d774214b4552df': {
    name: 'Années 90',
    slug: 'annees-90',
  },
  '53342101f3d774214b4552e0': {
    name: 'Années 80',
    slug: 'annees-80',
  },
  '53342101f3d774214b4552e1': {
    name: 'Années 70',
    slug: 'annees-70',
  },
  '53342101f3d774214b4552e2': {
    name: 'Electro',
    slug: 'electro',
  },
  /*
  '53342101f3d774214b4552e3': {
    name: 'Variété française',
    slug: 'variete-francaise',
  },
  */
};

db.get('themes').find({}, function(err,docs){
  for(var k in docs){

    if( typeof(update_themes[docs[k].id_package])=='undefined' ){
      console.error('THEME INCONNU !');
      console.error(docs[k]);
      process.exit(1);
/*
      db.get('themes').remove(
        { _id: docs[k]._id }
      );
*/
      continue;
    }
    var x = update_themes[docs[k].id_package];
    console.log(x);

    db.get('themes').update(
      { id_package: docs[k].id_package },
      { $set: x }
    );

  }
});
  



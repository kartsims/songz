var config = require('./config'),
  db = require('monk')(config.db.host+':'+config.db.port+'/'+config.db.database)
  debug = require('debug')('songz');


var User = function(socket){

  this.socket = socket;
  this.id = socket.id;
  this.game_id = null;
  this.name = "Anonymous";

}



/************************************************
              INSTANCE METHODS
************************************************/


/*
  CHANGE USER'S NAME
 */
User.prototype.change_name = function(name){
  var data = {
    old_name: this.name,
    new_name: name
  };
  this.name = name;
  return data;
};




/************************************************
              STATIC METHODS
************************************************/


/*
  example function
 */
User.fn = function(){


};

module.exports = User;
// specific to game playing page
if( document.getElementById('console') ){

  var log = function(x){
    var c = document.getElementById('console');
    c.innerHTML += "<br>"+x;
  }

  // define all events available
  var events = {

    // new player enters the game
    newPlayer: function(data){
      log('New player : ' + data.name);
    },
    
    // a player left the game
    exitPlayer: function(data){
      log('A player has left : ' + data.name);
    }

  }

  var socket = io.connect('http://localhost:3030');
  // send info about which game we have selected
  // TODO
  // listen to events
  for (var fn in events){
    socket.on(fn, events[fn]);
  }

}
// end of game playing page
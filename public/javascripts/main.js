var log = function(x){
  var c = document.getElementById('console');
  c.innerHTML += "<br>"+x;
}



var actions = {

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
for (var fn in actions){
  socket.on(fn, actions[fn]);
}

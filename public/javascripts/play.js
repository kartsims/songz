/**
 * Play the game
 */

// define all events available
var events = {

  // new player enters the game
  new_player: function(data){
    console.log('New player : ' + data.name);
  },

  // someone has sent a message
  chat: function(data){
    var p = $('<p>').html(data.name + ' > ' + data.message);
    p.appendTo( $('#chatroom') );
  },
  
  // a player left the game
  exit_player: function(data){
    console.log('A player has left : ' + data.name);
  }

}

// open socket and listen to events
var socket = io.connect('http://localhost:3030');
for (var fn in events){
  socket.on(fn, events[fn]);
}


// chat - instant messaging
$('form#chat').submit(function(){
  socket.emit('chat', {
    message: $(this).find('input').first().val()
  });
  return false;
});

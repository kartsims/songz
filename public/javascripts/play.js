
var songz = {

  // prepare the page to start the game
  init: function(){

    // get the current state of the game
    $.ajax({
      url: '/play/data',
      dataType: 'json',
      success: function(data){
        songz.play(data); 
      }
    })

  },

  // we are ready, let's play !
  play: function(data){

console.log("LET'S PLAY !");
console.log(data);

    // open socket and listen to events
    songz.socket = io.connect('http://localhost:3030');
    for (var fn in this.socket_events){
      songz.socket.on(fn, this.socket_events[fn]);
    }

    // chat - instant messaging
    $('form#chat').submit(function(){
      var input = $(this).find('input').first();
      songz.socket.emit('chat', {
        message: input.val()
      });
      input.val('');
      return false;
    });

  },

  /**
   * Define all events available
   */
  socket_events: {

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

}
songz.init();

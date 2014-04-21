var songz = {

  socket: null,

  // load homepage
  init: function(){

    // show a list of themes
    $.ajax({
      url: '/game/themes',
      dataType: 'json',
      success: songz.view
    });

    // open socket and listen to events
    songz.socket = io.connect('http://localhost:3030');
    for (var fn in this.socket_events){
      songz.socket.on(fn, this.socket_events[fn]);
    }

  },

  // change displayed HTML content
  view: function(data){
console.log(data, 'view');
    var source = $('#'+data.template).html();
    var template = Handlebars.compile(source);
    var html = template(data);

    $('#content').html(html);
    $('#content a').click(function(){
      $.ajax({
        url: $(this).attr('href'),
        dataType: 'json',
        success: songz.view
      });
      return false;
    });
  },

  /**
   * Define all events to listen to
   */
  socket_events: {

    // new player enters the game
    new_player: function(data){
      console.log(data.name+' has joined the game');
    },

    // a player left the game
    exit_player: function(data){
      console.log(data.name + ' has left the game');
    }

  }

}
songz.init();

angular.module('appControllers', []).

  /*
    SOCKET.IO IMPLEMENTATION
    > is this the best place to put it ?
   */
  factory('mySocket', function (socketFactory) {
    var myIoSocket = io.connect('http://localhost:3030');
    return socketFactory({
      ioSocket: myIoSocket
    });
  }).

  /*
    HOME PAGE
   */
  controller('mainController', function($scope, $http, $location) {

    // when landing on the page, get all themes and show them
    $http.
      get('/api/home').
      success(function(data) {
        $scope.themes = data.themes;
        $scope.games = data.games;
        $scope.nb_online = data.nb_online;
      }).
      error(function(data) {
        console.log('Error: ' + data);
      });

    // request to join a game
    $scope.joinGame = function(){
      var theme_id = $('form select[name=theme_id]').val();
      $http.
        get('/api/join/'+theme_id).
        success(function(data) {
          $location.url('/play/'+data.game_id);
        }).
        error(function(data) {
          console.log('Error: ' + data);
        });
    }

  }).

  /*
    PLAY THE GAME
   */
  controller('gameController', function($scope, $http, $routeParams, $location, mySocket) {

    $scope.loading = true;

    // change my username
    $scope.change_name = function(){
      console.log("→ change_name", $scope.me.name);
      mySocket.emit('change_name', {
        id: $scope.me.id,
        name: $scope.me.name
      });
      $.cookie("username", $scope.me.name);
      $scope.toggle_name_form();
      return false;
    };

    // hide "change my name" form
    $scope.toggle_name_form = function(){
      $('#form-name').toggle();
      $('.header').toggle();
    };

    // leave the game
    $scope.leave_game = function(){
      console.log("→ leave_game");
      mySocket.emit('leave_game', {
        id: $scope.me.id
      });
      $location.url('/');
    };

    // look for saved username or pick a random one
    var username = typeof($.cookie('username'))=="undefined" ?
      "Anonymous" + Math.floor((Math.random()*100)+1) :
      $.cookie('username');

    // save username
    $scope.me = {
      name: username
    };
    $scope.change_name();

    // display a notification
    $scope.notify = function(html){
      console.log("notify", html);
      var now = new Date();
      var date = new String(now.getMinutes());
      if(date.length<2)
        date = "0"+date;
      date = now.getHours()+":"+date;
      if(date.length<5)
        date = "0"+date;
      $('<li>').html("<span class=\"date\">"+date+"</span>"+html).appendTo($('#notifications'));
    }

    // preload a song's URL
    $scope.preload_song = function(url){
      $scope.preload = url;
      // TODO: real preloading
    }

    // play a song
    $scope.jplayer = $("#jquery_jplayer").jPlayer({
      swfPath: "/bower_components/jplayer/jquery.jplayer"
    });
    $scope.play_song = function(url, duration){

      // play the song for X seconds
      $scope.jplayer.
        jPlayer("setMedia", {mp3: url}).
        jPlayer("play");
      
      $('#my-guess').val('');

      setTimeout(function(){
        $scope.jplayer.jPlayer("stop");
      }, duration);
    }

    // try a guess
    $scope.song = {
      artist: null,
      name: null
    }
    $scope.guess_song = function(){
      var a = FuzzySet();
      a.add($scope.song.artist);
      a.add($scope.song.name);
      var x = a.get($('#my-guess').val());
      for(var i in x){
        var score = x[i][0].toFixed(2);
        if( score<.4 ){
          $('#guess-results').html("Try again...");
        }
        else if( score<.75 ){
          $('#guess-results').html("Getting close...");
        }
        // artist found
        else if( x[i][1]==$scope.song.artist ){
          $('#my-guess').val('');
          $scope.guessed('artist');
        }
        // name found
        else if( x[i][1]==$scope.song.name ){
          $('#my-guess').val('');
          $scope.guessed('name');
        }
      }
    }

    // player guessed right
    $scope.guessed = function(field){
      if(field=='artist'){
        $('#guess-results').html("You found the artist !");
      }
      else if(field=='name'){
        $('#guess-results').html("You found the name of this song !");
      }
      else{
        return;
      }
      console.log("→ guessed ("+field+")");
      mySocket.emit('guessed', field);
    }

    // set up the game
    $http.
      get('/api/game/'+$routeParams.game_id).
      success(function(data) {
        // game has not been found, might be finished
        if( typeof(data.game_id)=='string' ){
          $location.url('/play/'+data.game_id);
        }
        // if the game is up and running
        else{
          $scope.loading = false;
          
          console.log('→ join_game', $routeParams.game_id);
          mySocket.emit('join_game', {game_id:$routeParams.game_id});

          $scope.notify("You joined the game");
        }
      }).
      error(function(data) {
        console.log('Error: ' + data);
      });

    /*
      SOCKET CUSTOM EVENTS
     */

    // update users list
    $scope.players = [];
    mySocket.forward('players_list', $scope);
    $scope.$on('socket:players_list', function (ev, data) {
      console.log('← players_list', data);
      $scope.players = data;
      $scope.nb_online = data.length;
    });

    // notify one's name has changed
    mySocket.forward('changed_name', $scope);
    $scope.$on('socket:changed_name', function (ev, data) {
      console.log('← changed_name', data);
      $scope.notify(data.old_name + " has changed his name for " + data.new_name);
    });

    // notify one has joined the game
    mySocket.forward('joined_game', $scope);
    $scope.$on('socket:joined_game', function (ev, data) {
      console.log('← joined_game', data);
      $scope.notify(data.name + " has joined the game");
    });

    // notify one has left the game
    mySocket.forward('left_game', $scope);
    $scope.$on('socket:left_game', function (ev, data) {
      console.log('← left_game', data);
      $scope.notify(data.name + " has left the game");
    });

    // play a new song
    mySocket.forward('play_song', $scope);
    $scope.$on('socket:play_song', function (ev, data) {
      console.log('← play_song', data);
      $scope.play_song(data.play, data.duration*1000);
      $('#track-progress').
        stop().
        css({
          width: '0%'
        }).
        animate({
          width: '100%'
        }, data.duration*1000, 'linear');
      $scope.preload_song(data.preload);
      // and update players list
      $scope.players = data.players;
      $scope.nb_online = data.players.length;
      // reset guess field
      $('#my-guess').val('');

      // TODO: move these
      $scope.song.name = data.name;
      $scope.song.artist = data.artist;
      // 
    });

    // preload a song
    mySocket.forward('preload_song', $scope);
    $scope.$on('socket:preload_song', function (ev, data) {
      console.log('← preload_song', data);
      $scope.preload_song(data.preload);
    });

    // receive the good answer at the end of the song
    $scope.songs = [];
    mySocket.forward('answer_song', $scope);
    $scope.$on('socket:answer_song', function (ev, data) {
      console.log('← answer_song', data);
      $scope.songs.unshift(data);
    });

    // redirect to games' results
    $scope.songs = [];
    mySocket.forward('game_finished', $scope);
    $scope.$on('socket:game_finished', function (ev, data) {
      console.log('← game_finished', data);
      $location.url('/results/'+data);
    });

  }).

  /*
    GAME RESULTS
   */
  controller('resultsController', function($scope, $http, $routeParams, $location) {

    // when landing on the page, get the game results
    $http.
      get('/api/results/'+$routeParams.game_id).
      success(function(data) {
        console.log(data);
        $scope.players = data.results.players;
        $scope.theme = data.theme;
      }).
      error(function(data) {
        console.log('Error: ' + data);
      });

  });



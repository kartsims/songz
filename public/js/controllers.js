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
    $scope.joinGame = function(theme_id){
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
    $scope.changeMyName = function(){
      console.log("→ change_name", $scope.me.name);
      mySocket.emit('change_name', {
        id: $scope.me.id,
        name: $scope.me.name
      });
      $.cookie("username", $scope.me.name);
    };

    // leave the game
    $scope.leaveGame = function(){
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
    $scope.changeMyName();

    // display a notification
    $scope.notify = function(html){
      console.log("notify", html);
      $('<li>').html(html).appendTo($('#notifications'));
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

  });



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

    // callback to change user'sname
    $scope.changeMyName = function(){
      console.log("[emit] change_name", $scope.me.name);
      mySocket.emit('change_name', {
        id: $scope.me.id,
        name: $scope.me.name
      });
    };

    // leave the game
    $scope.leaveGame = function(){
      console.log("[emit] leave_game");
      mySocket.emit('leave_game', {
        id: $scope.me.id
      });
      $location.url('/');
    };

    // pick a random user name
    $scope.me = {
      socket_id: mySocket.id,
      name: "Zarzouz"
    };
    console.log(mySocket);
    $scope.changeMyName();

    // update users list
    $scope.players = [];
    mySocket.on('players_list', function(data){
      console.log('[on] players_list', data);
      $scope.players = data;
      $scope.nb_online = data.length;
    });

    // set up the game
    $http.
      get('/api/game/'+$routeParams.game_id).
      success(function(data) {
        $scope.loading = false;
        
        console.log('[emit] join_game', $routeParams.game_id);
        mySocket.emit('join_game', {game_id:$routeParams.game_id});
      }).
      error(function(data) {
        console.log('Error: ' + data);
      });

  });



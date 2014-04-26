angular.module('playControllers', []).

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
    PLAY THE GAME
   */
  controller('gameController', function($scope, $http, $routeParams, $location, mySocket) {

    $scope.players = [];

    // tell everyone a new player has entered the game
    $scope.me = {
      username: "Zarzouz"
    };
console.log('emit join_game');
    mySocket.emit('join_game', {
      theme_id: $routeParams.theme_id,
      user: $scope.me
    });
    
    // $scope.players.push($scope.me);
// console.log($scope.players);

    // a new player has entered the game
    mySocket.on('new_player', function(mySocket){
      console.log('NEW PLAYER !');
      console.log(mySocket);
// console.log($scope.players);
      // $scope.players.push(mySocket);
    });

    // when landing on the page, get all themes and show them
    $http.
      get('/api/theme/'+$routeParams.theme_id).
      success(function(data) {
        if(data.theme==null){
          $location.url('/');
        }
        $scope.theme = data.theme;
      }).
      error(function(data) {
        console.log('Error: ' + data);
      });

    // change user name
    $scope.changeName = function(){
      mySocket.emit('change_name', {
        me: $scope.me,
        username: $scope.username
      });
      $scope.me.username = $scope.username;
      $scope.username = '';
    }

  });


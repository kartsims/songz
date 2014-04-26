angular.module('appRoutes', []).
  config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

    $routeProvider.

      // homepage
      when('/', {
        templateUrl: 'views/home.html',
        controller: 'mainController'
      }).
      // play the game
      when('/play/:game_id', {
        templateUrl: 'views/play.html',
        controller: 'gameController'
      }).
      otherwise({
        redirectTo: '/'
      });
      
    $locationProvider.html5Mode(true);

  }]);

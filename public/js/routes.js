angular.module('appRoutes', []).
  config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

    $routeProvider.

      // homepage
      when('/', {
        templateUrl: 'views/home.html',
        controller: 'mainController'
      }).
      // play the game
      when('/play/:theme_id', {
        templateUrl: 'views/play.html',
        controller: 'gameController'
      }).
      // theme details
      when('/:theme_id', {
        templateUrl: 'views/theme.html',
        controller: 'themeDetailController'
      }).
      otherwise({
        redirectTo: '/'
      });
      
    $locationProvider.html5Mode(true);

  }]);

angular.module('appServices', []).

  // super simple service
  // each function returns a promise object 
  factory('Themes', function($http) {
    return {
      get : function() {
        return $http.get('/game/home');
        // return $http.get('/api/themes');
      }
    }
  });

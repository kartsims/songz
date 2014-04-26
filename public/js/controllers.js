angular.module('appControllers', []).

  /*
    HOME PAGE
   */
  controller('mainController', function($scope, $http) {

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

  }).


  /*
    THEME DETAILS
   */
  controller('themeDetailController', function($scope, $http, $routeParams, $location) {

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

  });



var appController = angular.module('appController', []);

/*
  HOME PAGE
 */
appController.controller('mainController', function($scope, $http) {

  // when landing on the page, get all themes and show them
  $http.get('/api/home')
    .success(function(data) {
      $scope.themes = data.themes;
      $scope.nb_online = data.nb_online;
    })
    .error(function(data) {
      console.log('Error: ' + data);
    });
/*
  // when submitting the add form, send the text to the node API
  $scope.createTodo = function() {
    $http.post('/api/todos', $scope.formData)
      .success(function(data) {
        $scope.formData = {}; // clear the form so our user is ready to enter another
        $scope.todos = data;
      })
      .error(function(data) {
        console.log('Error: ' + data);
      });
  };
*/

});


/*
  THEME DETAILS
 */
appController.controller('themeDetailController', function($scope, $http, $routeParams, $location) {

  // when landing on the page, get all themes and show them
  $http.get('/api/theme/'+$routeParams.theme_id)
    .success(function(data) {
      if(data.theme==null){
        $location.url('/');
      }
      $scope.theme = data.theme;
    })
    .error(function(data) {
      console.log('Error: ' + data);
    });

});


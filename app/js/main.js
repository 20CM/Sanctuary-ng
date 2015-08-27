(function () {

'use strict';


  var snApp = angular.module('snApp', ['ngRoute', 'ngStorage', 'ngAnimate', 'snServices', 'ngCookies']);

  snApp.config([
    '$locationProvider',
    '$routeProvider',
    '$httpProvider',

    function($locationProvider, $routeProvider, $httpProvider) {
      $locationProvider.hashPrefix('!');
      // routes
      $routeProvider
        .when("/", {
          templateUrl: "./partials/partial1.html",
          controller: "MainController"
        })
        .when("/signin", {
          templateUrl: './partials/user/signin.html',
          controller: "UserController"
        })
        .when("/signup", {
          templateUrl: './partials/user/signup.html',
          controller: "UserController"
        })
        .when("/users", {
          templateUrl: './partials/user/gallery.html',
          controller: "UserController"
        })
        .otherwise({
           redirectTo: '/'
        });
      $httpProvider.interceptors.push(['$q', '$location', '$localStorage', function($q, $location, $localStorage) {
        return {
            'request': function (config) {
                config.headers = config.headers || {};
                if (($localStorage.user !== {}) && ($localStorage.user !== undefined)) {
                    config.headers.Authorization = 'Token ' + $localStorage.user.token;
                }
                return config;
            },
            'responseError': function(response) {
                if(response.status === 401 || response.status === 403) {
                    $location.path('/signin');
                }
                return $q.reject(response);
            }
        };
      }]);
      $httpProvider.defaults.headers.common['Content-Type'] = 'application/json';
      $httpProvider.defaults.xsrfCookieName = 'csrftoken';
      $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
    }
  ])
  //Load controller
  .controller('MainController', ['$scope', '$localStorage', 'User', function($scope, $localStorage, User){
    $scope.user = User.getCurrentUser();
    $scope.logout = function() {
    User.logout(function() {
        window.location = "/";
    }, function() {
        alert("Failed to logout!");
    });
    };
  }])
  .controller('UserController', [
    '$rootScope', '$scope', '$location', '$localStorage', '$http', 'User',
    function($rootScope, $scope, $location, $localStorage, $http, User) {
 
        $scope.signin = function() {
            var formData = {
                username: $scope.username,
                password: $scope.password
            };
 
            User.signin(formData, function(res) {
              $localStorage.user = res;
              window.location = "/";    
            }, function(res) {
                $rootScope.error = 'Failed to signin';
                if (res.type === undefined) {
                  console.log(res);
                }
            });
        };
 
        $scope.signup = function() {
            var formData = {
                username: $scope.username,
                email: $scope.email,
                password: $scope.password
            };
 
            User.save(formData, function(response) {
                console.log(response.status);
                if (response.status != 201) {
                    alert(response.data);
                } else {
                  User.signin(formData, function(res) {
                    $localStorage.user = res;
                    window.location = "/";    
                  }, function(res) {
                      $rootScope.error = 'Failed to signin';
                      if (res.type === undefined) {
                        console.log(res);
                      }
                  });
                }
            }, function(response) {
                console.log(response.status);
                $rootScope.error = 'Failed to signup';
            });
        };
 
        $scope.me = function() {
            User.me(function(res) {
                $scope.myDetails = res;
            }, function() {
                $rootScope.error = 'Failed to fetch details';
            });
        };
 
        $scope.logout = function() {
            User.logout(function() {
                window.location = "/";
            }, function() {
                alert("Failed to logout!");
            });
        };

        User.query(function(res){
          $scope.users = res;
        }, function() {
          console.log("error");
        });

    }
  ]);

}());
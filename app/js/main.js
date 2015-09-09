(function () {

'use strict';


  var snApp = angular.module('snApp', ['ngRoute', 'ngStorage', 'ngAnimate', 'snServices', 'ngCookies', 'angular-md5']);

  snApp.config([
    '$locationProvider',
    '$routeProvider',
    '$httpProvider',

    function($locationProvider, $routeProvider, $httpProvider) {
      $locationProvider.hashPrefix('!');
      // routes
      $routeProvider
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
          controller: "UserController",
          page_mode: 'user_list'
        })
        .when("/user/:pk", {
          templateUrl: './partials/user/view.html',
          controller: "UserController",
          page_mode: 'user_page'
        })
        .when("/me", {
          templateUrl: './partials/user/view_me.html',
          controller: "UserController",
          page_mode: 'me_page'
        })
        .when("/topics", {
          templateUrl: './partials/topic/list.html',
          controller: "TopicController",
          page_mode: 'topic_list'
        })
        .when("/topics/:page", {
          templateUrl: './partials/topic/list.html',
          controller: "TopicController",
          page_mode: 'topic_list'
        })
        .when("/topic/:pk", {
          templateUrl: './partials/topic/view.html',
          controller: "TopicController",
          page_mode: 'topic_page'
        })
        .otherwise({
           redirectTo: '/topics'
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
    '$rootScope', '$scope', '$route' ,'$location', '$localStorage', '$http', '$routeParams','User', 'Topic',
    function($rootScope, $scope, $route, $location, $localStorage, $http, $routeParams, User, Topic) {
        $scope.user = $localStorage.user;
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
        if ($route.current.$$route.page_mode == "user_list") {
          User.query(function(res){
            $scope.users = res;
          }, function() {
            console.log("error");
          });
        }
        if ($route.current.$$route.page_mode == "user_page") {
          $scope.getUserInfo = function() {
            var r = {};
            r = User.queryUser($routeParams.pk, function(res){return res.data;}, function(){return {};}).$$state;
            return r;
          };
          User.queryUserTopics($routeParams.pk, 1, function(res){
            $scope.topics = res.data;
          }, function(res){
            alert("Error");
            window.location = "/";
          });
        }
        if ($route.current.$$route.page_mode == "me_page") {
          $scope.getUserInfo = function() {
            var r = {};
            r = User.queryUser($scope.user.id, function(res){return res.data;}, function(){return {};}).$$state;
            return r;
          };
          User.queryUserTopics($scope.user.id, 1, function(res){
            $scope.topics = res.data;
          }, function(res){
            alert("Error");
            window.location = "/";
          });
        }
        
    }
  ])
  .controller('TopicController', ['$scope', '$localStorage', '$route', '$routeParams', 'User', 'Topic', function($scope, $localStorage, $route, $routeParams, User, Topic){
    $scope.getUserInfo = function(id) {
      var r = {};
      r = User.queryUser(id, function(res){return res.data;}, function(){return {};}).$$state;
      return r;
    };
    if (typeof $routeParams.page !== 'undefined') {}
    if ($route.current.$$route.page_mode == "topic_list") {
      if (typeof $routeParams.page !== 'undefined') {
        $scope.list_page = 1;
      } else {
        $scope.list_page = $routeParams.page;
      }
      Topic.query($scope.list_page, function(res){
        $scope.topics = res.data;
      }, function(res){
        alert("Error");
        window.location = "/";
      });
    }
    if ($route.current.$$route.page_mode == 'topic_page') {
      Topic.view($routeParams.pk, function(res){
        $scope.t = res.data;
      }, function(){})
    }
    if ($route.current.$$route.page_mode == 'topic_list_a_la_tag') {
      
    }
  }]);
}());
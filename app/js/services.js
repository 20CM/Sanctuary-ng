var snServices = angular.module('snServices', ['ngStorage']);

snServices

.factory('User', ['$http', '$localStorage', 
  function($http, $localStorage){
  	var urlFix = 'http://not.only.20cm.me/api/';
  	function changeUser(u) {
      angular.extend(currentUser, u);
    }
    function getUser() {
      var storedUser = $localStorage.user;
      var user;
      if (storedUser !== undefined) {
        $http.get(urlFix + 'users/' + storedUser.id  + '/' ).then(function(r){
          user = angular.extend(storedUser, r.data);
        }, function(){alert("Error!");});
      }
      return user;
    }
  	var currentUser = getUser();
  	return {
  	  query: function(success, error) {
        $http.get(urlFix + 'users/', {}).success(success).error(error);
      },
      queryUser: function(id, success, error) {
        return $http.get(urlFix + 'users/' + id + '/').then(success, error);
      },
      queryUserTopics: function(id, page, success, error) {

        $http.get(urlFix + 'topics/' + '?author=' + id + '&page=' + page + '/').then(success, error);
      },
      save: function(data, success, error) {
        $http.post(urlFix + 'users/', data).then(success, error);
      },
      signin: function(data, success, error) {
        $http.post(urlFix + 'users/obtain_auth_token/', data).success(success).error(error);
      },
      logout: function(success) {
        delete $localStorage.user;
        success();
      },
      getCurrentUser: function() {
        return getUser();

      },
      me: function(success, error) {
        if (currentUser !== {}) {
          return $http.get(urlFix + '/users/' + currentUser.id  + '/', {}).success(success).error(error);
        } else {
          error();
        }
      }
  	};
}])
.factory('Topic', ['$http', '$localStorage', function($http, $localStorage){
  var urlFix = 'http://not.only.20cm.me/api/';
  return {
    query: function(page, success, error) {
      $http.get(urlFix + 'topics/', {page: page}).then(success, error);
    },
    view: function(q, success, error) {
      $http.get(urlFix + 'topics/' + q + '/', {}).then(success, error);
    },
    viewById: function(id, success, error) {
      $http.get(urlFix + 'topics/' + q + '/', {}).then(function(res){
        var topic_info;
        $http.get(urlFix + 'replies/' + q + '/').then(function(res0){

        });
      }, error);
    },
    viewBySlug: function(slug, success, error) {

    },
    getReplies: function(id, page, success, error) {
      page = typeof page !== 'undefined' ? page : 1;
      $http({
        method: 'GET',
        url: urlFix + 'replies/?topic=' + id + '&page=' + page
      }).then(success, error);
    }
  };
}]);

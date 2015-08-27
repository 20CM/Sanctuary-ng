var snServices = angular.module('snServices', ['ngStorage']);

snServices.factory('User', ['$http', '$localStorage', 
  function($http, $localStorage){
  	var urlFix = 'http://not.only.20cm.me/api/';
  	function changeUser(user) {
      angular.extend(currentUser, user);
    }
    function getUser() {
      var storedUser = $localStorage.user;
      var user = {};
      if (storedUser !== undefined) {
    	 user = storedUser;
      }
      return user;
    }
  	var currentUser = getUser();

  	return {
  	  query: function(success, error) {
        $http.get(urlFix + 'users/', {}).success(success).error(error);
      },
      queryUser: function(username, success, error) {
        $http.get(urlFix + 'users/' + username).then(success(), error());
      },
      save: function(data, success, error) {
        $http.post(urlFix + 'users/', data).then(success, error);
      },
      signin: function(data, success, error) {
        $http.post(urlFix + 'users/obtain_auth_token/', data).success(success).error(error);
      },
      logout: function(success) {
        changeUser();
        delete $localStorage.user;
        success();
      },
      getCurrentUser: function() {
        return getUser();

      },
      me: function(success, error) {
        if (currentUser !== {}) {
          return $http.get(urlFix + '/users/' + currentUser.id, {}).success(success).error(error);
        } else {
          error();
        }
      }
  	};
}]);

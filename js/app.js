
var INTEGER_REGEXP = /[0-9]/;
var UPPER_REGEXP = /[A-Z]/;
var LOWER_REGEXP = /[a-z]/;
var SYMBOL_REGEXP = /[\!\@\#\$\%\^\&\*]/;
var INVALID_REGEXP = /[^A-z0-9\!\@\#\$\%\^\&\*]/g;

angular.module('eventApp', ['ngRoute', 'firebase', 'ui.bootstrap', 'ngAria', 'ngA11y'])

.value('fbURL', 'https://eventplnr.firebaseio.com/')

.service('fbRef', function(fbURL) {
  return new Firebase(fbURL);
})

.service('events', function($firebaseArray, fbRef){
    var events = $firebaseArray(fbRef);
    return events;
})

.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
    when('/eventlist', {
        templateUrl:'partials/list.html',
        controller: 'EventListCtrl as eventList',
        title: 'Event List'
    }).
    when('/newaccount', {
        templateUrl: 'partials/account.html',
        controller: 'NewAccountCtrl',
        title: 'Create New Account'
    }).
    when('/new', {
        templateUrl: 'partials/newevent.html',
        controller: 'NewEventCtrl',
        title: 'Create New Event'
    }).
    otherwise({
        redirectTo: '/eventlist'
    });
}])


.run(['$location', '$rootScope', function($location, $rootScope) {
    $rootScope.$on('$viewContentLoaded', function () {

        // Default - set page focus to first input
        var firstElement = $('input, select').filter(':visible:first');
        if (firstElement)
          firstElement.focus();
    });
}])


.controller('RootCtrl', ['$scope', function($scope) {
    /**
     * Collapses the navbar on mobile devices.
     */
    $scope.collapseNavbar = function () {
        angular.element(document.querySelector('.navbar-collapse')).removeClass('in');
    };

}])

.controller('EventListCtrl', [ "$scope", "events", function( $scope, events) {
    var eventList = this;
    eventList.events = events;
}])

.controller('NewEventCtrl', ['$scope', 'events', '$location', function($scope, events, $location) {
    $scope.createEvent = function() {

        //call $add on the firebaseArray with the new event
        $scope.event.start = $scope.event.eventstart.toString();
        $scope.event.end = $scope.event.eventend.toString();
        events.$add($scope.event);
        $location.path('/eventlist');

    };

    $scope.isValidTime = function() {
        if (!$scope.event || !$scope.event.eventend) {
            return true;
        }
        return $scope.event.eventstart<=$scope.event.eventend;
    }

    $scope.init = function() {
        // Create the autocomplete object, restricting the search to geographical
        // location types.
        $scope.autocomplete = new google.maps.places.Autocomplete(
          document.getElementById('location'));
    };

    $scope.geoLocate = function () {
        // Bias the autocomplete object to the user's geographical location,
        // as supplied by the browser's 'navigator.geolocation' object.
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                var geolocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                var circle = new google.maps.Circle({
                    center: geolocation,
                    radius: position.coords.accuracy
                });
                $scope.autocomplete.setBounds(circle.getBounds());
            });
        }
    };

}])

.controller('NewAccountCtrl', ['$scope', function($scope, $location) {

}])

.directive('password', function() {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$validators.neednumber = function(modelValue, viewValue) {
        if (ctrl.$isEmpty(modelValue)) {
          // consider empty models to be invalid
          return false;
        }

        if (INTEGER_REGEXP.test(viewValue)) {
          // it is valid
          return true;
        }

        // it is invalid
        return false;
      };
      ctrl.$validators.needlower = function(modelValue, viewValue) {
        if (ctrl.$isEmpty(modelValue)) {
          // consider empty models to be invalid
          return false;
        }

        if (LOWER_REGEXP.test(viewValue)) {
          // it is valid
          return true;
        }

        // it is invalid
        return false;
      };

      ctrl.$validators.needupper = function(modelValue, viewValue) {
        if (ctrl.$isEmpty(modelValue)) {
          // consider empty models to be invalid
          return false;
        }

        if (UPPER_REGEXP.test(viewValue)) {
          // it is valid
          return true;
        }

        // it is invalid
        return false;
      };

      ctrl.$validators.needsymbol = function(modelValue, viewValue) {
        if (ctrl.$isEmpty(modelValue)) {
          // consider empty models to be invalid
          return false;
        }

        if (SYMBOL_REGEXP.test(viewValue)) {
          // it is valid
          return true;
        }

        // it is invalid
        return false;
      };

      ctrl.$validators.invalidcharacter = function(modelValue, viewValue) {
        if (ctrl.$isEmpty(modelValue)) {
          // consider empty models to be valid
          return true;
        }

        if (INVALID_REGEXP.test(viewValue)) {
          // it is invalid
          return false;
        }

        // it is valid
        return true;
      };

      ctrl.$validators.length = function(modelValue, viewValue) {
        if (ctrl.$isEmpty(modelValue)) {
          // consider empty models to be valid
          return true;
        }

        if (viewValue.length<8) {
          // it is invalid
          return false;
        }

        // it is valid
        return true;
      };
    }
  };
});
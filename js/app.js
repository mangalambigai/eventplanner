
var INTEGER_REGEXP = /[0-9]/;
var UPPER_REGEXP = /[A-Z]/;
var LOWER_REGEXP = /[a-z]/;
var SYMBOL_REGEXP = /[\!\@\#\$\%\^\&\*]/;
var INVALID_REGEXP = /[^A-z0-9\!\@\#\$\%\^\&\*]/g;

angular.module('eventApp', ['ngRoute', 'firebase', 'ui.bootstrap', 'ngAria'])

.value('fbURL', 'https://eventplnr.firebaseio.com/')

.service('fbRef', function(fbURL) {
  return new Firebase(fbURL);
})

.service('events', function($firebaseArray, fbRef){
    var events = $firebaseArray(fbRef);
    return events;
})
/*
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

/*
//http://simplyaccessible.com/article/spangular-accessibility/
//routing doesnt seem to be accessible using lynx - even with this code from spangular :-(
.run(['$location', '$rootScope', function($location, $rootScope) {
  var history; // stores uri of last page viewed - Used to track if we should set focus to main H1
  var currentURL; // store uri of current page viewed - Used to track if we should set focus to main H1

  //set the title for screen reader
    $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
        // test for current route
        if(current.$$route) {
            // store current path
            currentURL = current.$$route.originalPath;
            // Set current page title
            $rootScope.title = current.$$route.title;
        }
       // When navigating between pages track the last page we were on
        // to know if we should be setting focus on the h1 on view update
        if(previous) {
            if(previous.$$route){
                history = previous.$$route.originalPath;
            }
        }
    });
    $rootScope.$on('$viewContentLoaded', function () {

        // Once the template loads set focus to the h1 to manage focus
        // if there is no history do not adjust focus this is the first page the user is seeing
        if(history) {
            // Default - set page focus to h1
            $('h1').attr("tabIndex", -1).focus();
        }
    });
}])
*/

//from spangular to display the events in
.directive('setLastFocus', function($timeout, $rootScope) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true && $rootScope.lastTicketID != "") {
                $timeout(function () {
                    if($rootScope.flashMsg == "" && $rootScope.lastForm == "edit"){
                        $("#" + $rootScope.lastTicketID + " .edit-btn").focus();
                        $rootScope.lastTicketID = "";
                        $rootScope.lastForm = "";
                    }
                });
            }
        }
    }
})
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
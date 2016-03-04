/**
 * @ngdoc object
 * @name eventApp
 * @requires ngRoute
 * @requires firebase
 * @requires ui.bootstrap
 *
 * @description
 * Root app, which routes the partial html.
 *
 */
angular.module('eventApp', ['ngRoute', 'firebase', 'ui.bootstrap', 'ngAria'])
.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
    when('/eventlist', {
        templateUrl: 'partials/list.html',
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

/**
 * @ngdoc value
 * @name fbURL
 *
 * @description
 * Holds the firebase url
 *
 */
.value('fbURL', 'https://eventplnr.firebaseio.com/')

/**
 * @ngdoc service
 * @name fbRef
 *
 * @description
 * Service for the firebase
 *
 */
.service('fbRef', function(fbURL) {
    return new Firebase(fbURL);
})

/**
 * @ngdoc service
 * @name events
 *
 * @description
 * Service that holds the firebase events array
 *
 */
.service('events', function($firebaseArray, fbRef) {
    var events = $firebaseArray(fbRef);
    return events;
})

/**
 * @ngdoc run
 *
 * @description
 * sets the focus on the first form element when new view is loaded
 *
 */

.run(['$location', '$rootScope', function($location, $rootScope) {
    $rootScope.$on('$viewContentLoaded', function() {

        // Default - set page focus to first input
        var firstElement = $('input, select').filter(
            ':visible:first');
        if (firstElement)
            firstElement.focus();
    });
}])

/**
 * @ngdoc controller
 * @name RootCtrl
 *
 * @description
 * Root Controller for index.html
 *
 */
.controller('RootCtrl', ['$scope', function($scope) {
    /**
     * Collapses the navbar on mobile devices.
     */
    $scope.collapseNavbar = function() {
        angular.element(document.querySelector(
            '.navbar-collapse')).removeClass('in');
    };

}])

/**
 * @ngdoc controller
 * @name EventListCtrl
 *
 * @description
 * Controller for the list of events
 *
 */
.controller('EventListCtrl', ['$scope', 'events', function($scope, events) {
    var eventList = this;
    eventList.events = events;
}])

/**
 * @ngdoc controller
 * @name NewEventCtrl
 *
 * @description
 * Controller for create new events page
 *
 */
.controller('NewEventCtrl', ['$scope', 'events', '$location', function($scope,
    events, $location) {

    /**
     * Creates the new event in firebase
     */
    $scope.createEvent = function() {

        //call $add on the firebaseArray with the new event
        $scope.event.start = $scope.event.eventstart.toString();
        $scope.event.end = $scope.event.eventend.toString();
        events.$add($scope.event);
        $location.path('/eventlist');

    };

    /**
     * Checks if the event start time and end time are valid
     * @returns {boolean} true if valid, false otherwise
     */
    $scope.isValidTime = function() {
        if (!$scope.event || !$scope.event.eventend) {
            return true;
        }
        return $scope.event.eventstart <= $scope.event.eventend;
    }

    /**
     * Initializes the google places autocomplete object
     */
    $scope.init = function() {
        // Create the autocomplete object, restricting the search to geographical
        // location types.
        $scope.autocomplete = new google.maps.places.Autocomplete(
            document.getElementById('location'));

        // When the user selects an address from the dropdown,
        // set it to the model, or angular doesn't know it changed
        $scope.autocomplete.addListener('place_changed', function() {
            $scope.event.location = $('#location').val();
            $scope.$apply();
        });
    };

    /**
     * Geo locates to bias the autocomplete results to users location
     */
    $scope.geoLocate = function() {
        // Bias the autocomplete object to the user's geographical location,
        // as supplied by the browser's 'navigator.geolocation' object.
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(
                position) {
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

    /**
     * TODO: use the autocomplete result to set the firebase location data
     */

}])

/**
 * @ngdoc controller
 * @name NewAccountCtrl
 *
 * @description
 * Controller for create new accounts page
 *
 */
.controller('NewAccountCtrl', ['$scope', function($scope, $location) {
//TODO: fill this out for creating new accounts
}])

/**
 * @ngdoc constant
 * @name PASSWORD
 *
 * @description
 * Holds the constants related to password
 *
 */
 .constant('PASSWORD', {
    'INTEGER_REGEXP': /[0-9]/,
    'UPPER_REGEXP': /[A-Z]/,
    'LOWER_REGEXP': /[a-z]/,
    'SYMBOL_REGEXP': /[\!\@\#\$\%\^\&\*]/,
    'INVALID_REGEXP': /[^A-z0-9\!\@\#\$\%\^\&\*]/g,
    'MIN_PWD_LENGTH': 8
})

/**
 * @ngdoc directive
 * @name password
 *
 * @description
 * Directive for checking password validity
 *
 */
.directive('password', [ 'PASSWORD', function(PASSWORD) {
    return {
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {

            /**
             * Tests if the value has atleast one numeric digit
             * @returns {boolean} true if it has numbers
             */
            ctrl.$validators.neednumber = function(modelValue,
                viewValue) {
                if (ctrl.$isEmpty(modelValue)) {
                    // consider empty models to be invalid
                    return false;
                }

                if (PASSWORD.INTEGER_REGEXP.test(viewValue)) {
                    // it is valid
                    return true;
                }

                // it is invalid
                return false;
            };

            /**
             * Tests if the value has atleast one lowercase letter
             * @returns {boolean} true if it has one
             */
            ctrl.$validators.needlower = function(modelValue,
                viewValue) {
                if (ctrl.$isEmpty(modelValue)) {
                    // consider empty models to be invalid
                    return false;
                }

                if (PASSWORD.LOWER_REGEXP.test(viewValue)) {
                    // it is valid
                    return true;
                }

                // it is invalid
                return false;
            };

            /**
             * Tests if the value has atleast one uppercase letter
             * @returns {boolean} true if it has one
             */
            ctrl.$validators.needupper = function(modelValue,
                viewValue) {
                if (ctrl.$isEmpty(modelValue)) {
                    // consider empty models to be invalid
                    return false;
                }

                if (PASSWORD.UPPER_REGEXP.test(viewValue)) {
                    // it is valid
                    return true;
                }

                // it is invalid
                return false;
            };

            /**
             * Tests if the value has atleast one valid symbol
             * @returns {boolean} true if it has one
             */
            ctrl.$validators.needsymbol = function(modelValue,
                viewValue) {
                if (ctrl.$isEmpty(modelValue)) {
                    // consider empty models to be invalid
                    return false;
                }

                if (PASSWORD.SYMBOL_REGEXP.test(viewValue)) {
                    // it is valid
                    return true;
                }

                // it is invalid
                return false;
            };

            /**
             * Tests if the value has only valid symbols
             * @returns {boolean} false if it has any invalid symbols
             */
            ctrl.$validators.invalidcharacter = function(modelValue,
                viewValue) {
                if (ctrl.$isEmpty(modelValue)) {
                    // consider empty models to be valid
                    return true;
                }

                if (PASSWORD.INVALID_REGEXP.test(viewValue)) {
                    // it is invalid
                    return false;
                }

                // it is valid
                return true;
            };

            /**
             * Tests if the value has the minimum number of characters
             * @returns {boolean} true if it has the required number of characters
             */
            ctrl.$validators.length = function(modelValue,
                viewValue) {
                if (ctrl.$isEmpty(modelValue)) {
                    // consider empty models to be valid
                    return true;
                }

                if (viewValue.length < PASSWORD.MIN_PWD_LENGTH) {
                    // it is invalid
                    return false;
                }

                // it is valid
                return true;
            };
        }
    };
}]);
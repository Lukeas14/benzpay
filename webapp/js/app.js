'use strict';

angular.module('benzpay', ['ngRoute'])
	.controller('MainController', function($scope, $route, $routeParams){
		$scope.activeTab;
		$scope.$route = $route;
		console.log('main controller');
	})

	.controller('HomeController', function($scope, $route, $routeParams) {
		$scope.$parent.activeTab = 'home';
		console.log('home controller', $route, $routeParams);
		$scope.$route = $route;
		$scope.$routeParams = $routeParams;
	})

	.controller('WifiController', function($scope, $routeParams) {
		$scope.name = "BookController";
		$scope.params = $routeParams;
	})

	.controller('WarningsController', function($scope, $routeParams) {
	})

	.controller('PeersController', function($scope, $routeParams) {
	})

	.controller('SettingsController', function($scope, $routeParams) {
	})

	.controller('PayController', function($scope, $routeParams) {
	})

	.controller('ParkingController', function($scope, $routeParams) {
	})

	.controller('DriveController', function($scope, $routeParams) {
	})

	.config(function($routeProvider, $locationProvider) {
		$routeProvider
			.when('/home', {
				templateUrl: 'templates/home.html',
				controller: 'HomeController'
			})
			.when('/wifi', {
				templateUrl: 'templates/wifi.html',
				controller: 'WifiController'
			})
			.when('/warnings', {
				templateUrl: 'templates/warnings.html',
				controller: 'WarningsController'
			})
			.when('/peers', {
				templateUrl: 'templates/peers.html',
				controller: 'PeersController'
			})
			.when('/settings', {
				templateUrl: 'templates/settings.html',
				controller: 'SettingsController'
			})
			.when('/pay', {
				templateUrl: 'templates/pay.html',
				controller: 'PayController'
			})
			.when('/parking', {
				templateUrl: 'templates/parking.html',
				controller: 'ParkingController'
			})
			.when('/drive', {
				templateUrl: 'templates/drive.html',
				controller: 'DriveController'
			})
			.otherwise({
				redirectTo: '/home'
			});

		// configure html5 to get links working on jsfiddle
		//$locationProvider.html5Mode(true);
	});
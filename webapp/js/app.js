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
		console.log('set up map');
		nokia.Settings.set("app_id", "evalLunne37Ciwejfare7");
		nokia.Settings.set("app_code", "RrEcE54Hc6U2VGp70LqoQQ");
		var map = new nokia.maps.map.Display(
			document.getElementById("map-container"), {
				components: [
					// Behavior collection
					new nokia.maps.map.component.Behavior(),
					new nokia.maps.map.component.Overview(),
				],
				// Zoom level for the map
				zoomLevel: 17,
				// Map center coordinates
				center: [37.4121407222, -122.204705778],
				baseMapType: nokia.maps.map.Display.SMARTMAP
			}
		);
		map.addListener("displayready", function() {
			// Place code implementing the functionality of app
			// here, for example to manipulate the map view.
			window.WebSocket = window.WebSocket || window.MozWebSocket;
			var connection = new WebSocket('ws://127.0.0.1:3001');
			connection.onopen = function () {
				console.log('websocket open');
			};
			connection.onerror = function (error) {
				console.log('websocket error', error);
			};
			connection.onmessage = function (message) {
				var vehicleData = JSON.parse(message.data);

				if(vehicleData.command){
					console.log('command', vehicleData.command);
				}
				else {
					console.log(vehicleData);
					map.setCenter([vehicleData.GPS_Latitude, vehicleData.GPS_Longitude]);
				}
			};
		});


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
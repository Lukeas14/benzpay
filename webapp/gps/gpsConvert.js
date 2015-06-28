var parse = require('csv-parse');
var _ = require('underscore');
var fs = require('fs');

var routes = [];

var route = function(line){
	var route = {
		"GPS_Longitude": parseFloat(line[2]),
		"GPS_Latitude": parseFloat(line[1]),
		"Timestamp": line[0],
		"Bearing": line[5]
	};
	routes.push(route);
};

var writeFile = function(){
	fs.writeFile("../vehicleData2.json", JSON.stringify({"responses": routes}), function(){
		console.log('Done');
	})
};

fs.readFile('./start.csv', 'utf8', function(err, data){
	if(err){
		return console.log(err);
	}

	parse(data, {comment: '#'}, function(err2, output){
		if(err2){
			return console.log('parse error', err2);
		}

		_.each(output, function(line){
			route(line);
		});

		fs.readFile('./shellToParking.csv', 'utf8', function(err, data){
			parse(data, {}, function(err, output){
				_.each(output, function(line){
					route(line);
				});

				fs.readFile('./parking2.csv', 'utf8', function(err, data){
					parse(data, {}, function(err, output){
						_.each(output, function(line){
							route(line);
						});

						console.log('success', JSON.stringify({"responses": routes}));
						writeFile();
					});
				});

			});
		});




	})
});

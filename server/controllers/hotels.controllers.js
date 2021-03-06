var mongoose = require('mongoose');
var Hotel = mongoose.model('Hotel');

var runGeoQuery = function(req, res) {

	var lng = parseFloat(req.query.lng);
	var lat = parseFloat(req.query.lat);

	if (isNaN(lng) || isNaN(lat)) {
    res
      .status(400)
      .json({
        "message" : "If supplied in querystring, lng and lat must both be numbers"
      });
    return;
  }

  // A geoJSON point
  var point = {
    type : "Point",
    coordinates : [lng, lat]
  };

  var geoOptions = {
    spherical : true,
    maxDistance : 2000,
    num : 1
  };

  Hotel
  	.geoNear(point, geoOptions, function(err, results, stats) {
  		console.log('Geo results', results);
  		console.log('Geo stats', stats);
  		if (err) {
  			console.log("Error finding hotel");
  			res
  				.status(500)
  				.json(err);
  		} else {
  			res
  				.status(200)
  				.json(results);
  		}
  	});
};

module.exports.hotelsGet = function(req, res) {

	var id = req.params.hotelId;

	console.log('GET hotelId', id);

	Hotel
		.findById(id)
		.exec(function(err, doc) {
			var response = {
				status: 200,
				message: doc
			};
			if (err) {
				console.log("Error finding hotel");
				response.status = 500;
				response.message = err;
			} else if (!doc) {
				console.log("HotelId not found in database", id);
				response.status = 404;
				response.message = {
					"message" : "Hotel ID not found " + id
				}
			}
			res
				.status(response.status)
				.json(response.message);
		});

};

var _splitArray = function(input) {
  var output;
  if (input && input.length > 0) {
    output = input.split(";");
  } else {
    output = [];
  }
  return output;
};

module.exports.hotelsAdd = function(req, res) {

	console.log("POST new hotel");

	Hotel
		.create({
			name: req.body.name,
			description: req.body.description,
			stars: parseInt(req.body.stars,10),
			photos: _splitArray(req.body.photos),
			currency: req.body.currency,
			location : {
				address: req.body.address,
				coordinates: [
				parseFloat(req.body.lng),
				parseFloat(req.body.lat)
				]
			}, function(err, hotel) {
				if (err) {
					console.log("Error creating hotel");
					res
						.status(400)
						.json(err);
				} else {
					console.log("Hotel created!", hotel);
					res
						.status(200)
						.json(hotel);
				}
			}
		});
};

















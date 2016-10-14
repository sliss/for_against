var config = require('../config');

var express = require('express');
var router = express.Router();
var rp = require('request-promise');
var urlencode = require('urlencode');

var db = require('./database');

/* POST address lookup request */
router.post('/', function(req, res, next) {
	console.log('lookup address:', req.body.address);
	
	var address = req.body.address;
	var encodedAddress = urlencode.encode(address);

	var options = {
	    uri: 'https://api.geocod.io/v1/geocode?q='
	    	+ encodedAddress 
	    	+ '&fields=cd,stateleg&api_key='
	    	+ config.geoAPIKey,
	    headers: {
	        'User-Agent': 'Request-Promise'
	    },
	    json: true // Automatically parses the JSON string in the response 
	};
	 
	rp(options)
	    .then(function (resp) {
	        var state = resp.results[0].address_components.state;
	        var districtNumber = resp.results[0].fields.congressional_district.district_number;
	        console.log('Lookup state/district:', state, '/', districtNumber);

	        // refactor promise chain later
	        db.getCandidates(state, districtNumber)
			.spread(function (rows) {
				if(rows && rows.length > 0){
					console.log(rows);

					// process rows
					for(var i = 0; i < rows.length; i++){
						if(rows[i].supports_trump === 1){
							rows[i].supports_trump = 'Yes';
							rows[i].agree_message = 'Thank you for standing with Trump.';
							rows[i].disagree_message = 'Please stand up against Trump!';
						}
						else if(rows[i].supports_trump === 0){
							rows[i].supports_trump = 'No';
							rows[i].agree_message = 'Thank you for standing against Trump!';
							rows[i].disagree_message = 'Please stand with Trump.';
						}
						else {
							rows[i].supports_trump = 'Unknown';
							rows[i].agree_message = 'We deserve to know where you stand with Trump!';
							rows[i].disagree_message = 'We deserve to know where you stand with Trump!';
						}
					}
					res.render('lookup', 
				 	{ 
				 		title: 'Ballot for ' + state.toUpperCase() + ' ' + 'District ' + districtNumber,
				 		data: rows 
				 	});
				}
				else {
					console.log('ERROR: no candidates found');
					// todo: handle case of no candidates found for address
					res.render('lookup', 
				 	{ 
				 		title: 'Sorry- no candidates found for that address',
				 		data: rows 
				 	});
				}
				
			});
        	
	    })
	    .catch(function (err) {
	    	console.log(err, 'error: geocode api call failed');
	        // API call failed... 
	    });
});

module.exports = router;
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
	        db.logQuery(state, districtNumber)
	        .then(function(){
	        	// refactor promise chain later
	        db.getCandidates(state, districtNumber)
			.spread(function (rows) {
				house = [],
				senate = [];

				// lookup senators
				db.getSenate(state)
					.spread(function (senateRows) {
						if(rows && rows.length > 0){
							// if there are any senate candidates, add to candidates rows
							if(senateRows.length > 0){
								rows = rows.concat(senateRows);
							}
							console.log(rows);

							// process rows
							for(var i = 0; i < rows.length; i++){
								//prepend twitter messages
								var twitterHeader;
								if(rows[i].twitter && rows[i].twitter.length > 0){
									twitterHeader = '@' + rows[i].twitter + ' ';
								}
								else {
									twitterHeader = rows[i].name + '- ';
								}

								// generate default tweets
								if(rows[i].supports_trump === 1){
									rows[i].supports_trump = 'YES';
									rows[i].agree_message = twitterHeader + 'Thank you for standing with Trump.';
									rows[i].disagree_message = twitterHeader + 'Please stand up against Trump!';
								}
								else if(rows[i].supports_trump === 0){
									rows[i].supports_trump = 'NO';
									rows[i].agree_message = twitterHeader + 'Thank you for standing against Trump!';
									rows[i].disagree_message = twitterHeader + 'Please stand with Trump.';
								}
								else {
									rows[i].supports_trump = 'UNKNOWN';
									rows[i].agree_message = twitterHeader + 'We deserve to know where you stand with Trump!';
									rows[i].disagree_message = twitterHeader + 'We deserve to know where you stand with Trump!';
								}

								// assign candidate to senate or house list
								if(rows[i].office && rows[i].office.indexOf('house')>-1){
									house.push(rows[i]);
								}
								else {
									if(rows[i].office.indexOf('senate')>-1){
										senate.push(rows[i]);
									}
								}
							}
							console.log('house:', house);
							// handle 'district 0' for at-large states
							var districtLabel = ' District ' + districtNumber;
							if(districtNumber == 0){
								districtLabel = ''
							}
							res.render('lookup', 
						 	{ 
						 		title: 'Congressional ballot for ' + state.toUpperCase() + districtLabel,
						 		house: house,
						 		senate: senate
						 	});
						}
						else {
							console.log('ERROR: no candidates found');
							// todo: handle case of no candidates found for address
							res.render('lookup', 
						 	{ 
						 		title: 'Sorry- no candidates found for that address',
						 		house: house,
						 		senate: senate
						 	});
						}
					}
				);
				
				
				
			});
	        });
	        
        	
	    })
	    .catch(function (err) {
	    	console.log(err, 'error: geocode api call failed');
	        // API call failed... 
	    });
});

module.exports = router;
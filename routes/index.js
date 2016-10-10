var express = require('express');
var router = express.Router();

var db = require('./database');

/* GET home page. */
router.get('/', function(req, res, next) {
	db.getPersons()
	.spread(function (rows) {
		 res.render('index', 
		 	{ title: 'For Against',
		 	data: rows });
	});
});

module.exports = router;

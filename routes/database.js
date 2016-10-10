var config = require('../config');

var express = require('express');
var router = express.Router();
var mysql      = require('mysql');
var connection = mysql.createConnection({
   host     : 'localhost',
   user     : 'root',
   password : config.mySQLPassword,
   database : 'events'
 });

var db = require('mysql-promise')();

db.configure({
	"host": "localhost",
	"user": "root",
	"password": config.mySQLPassword,
	"database": "events"
});

exports.getPersons = function(){
	console.log('db.getPersons');
 return db.query('SELECT * from potluck LIMIT 2');
	
};



// /* GET users listing via REST. */
// router.get('/test', function(req, res, next) {
// 	// test query
// 	connection.query('SELECT * from potluck LIMIT 2', function(err, rows, fields) {
// 	connection.end();
// 	if (!err){
// 	 console.log('The solution is: ', rows);
// 	 res.send(rows);
// 	}
// 	else
// 	{
// 	 console.log('Error while performing Query.');
// 	 res.status(400).send({Error:'error while performing query'});
// 		}
//   	});
// });

// module.exports = router;
var config = require('../config');

var express = require('express');
var router = express.Router();
var mysql      = require('mysql');

var db = require('mysql-promise')();

db.configure({
	"host": "localhost",
	"user": "root",
	"password": config.mySQLPassword,
	"database": config.mySQLDatabase
});

exports.logQuery = function(state, district){
	var district_key = state + district.toString();
	console.log('db.logQuery:', district_key);

	 return db.query(
	 	'INSERT into tally VALUES(\'' + district_key + '\', 1) ON DUPLICATE KEY ' +
	 	'UPDATE count = count + 1;'
	 );
};

exports.getCandidates = function(state, district){
	return db.query('SELECT * from candidates WHERE state = \'' 
	 	+ state + '\''
	 	+ ' AND district = ' 
	 	+ district
	);
};

exports.getSenate = function(state){
	return db.query('SELECT * from senate WHERE state = \'' 
	 	+ state + '\''
	);
};
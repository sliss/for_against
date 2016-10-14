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

exports.getCandidates = function(state, district){
	console.log('db.getCandidates:', state, district);
 return db.query('SELECT * from candidates WHERE state = \'' 
 	+ state + '\''
 	+ ' AND district = ' 
 	+ district
 );
};
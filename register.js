var express = require('express');
var mongodb = require('mongodb');
var myParser = require('body-parser');//這是新加的
var app = express();
var mongodbURL = 'mongodb://LIChing:justtheway402@ds021731.mlab.com:21731/tiny_chief';
var myDB;
var acceptac,acceptwd;
app.set('port', (process.env.PORT || 5000));

mongodb.MongoClient.connect(mongodbURL, function(err, db) {
	if (err) {
		console.log(err);
	} else {
		myDB = db;
		console.log('connection success');
	}
});